/**
 * Firestore コミュニティ投稿管理用ヘルパー関数
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Post,
  Comment,
  CreatePostData,
  UpdatePostData,
  CreateCommentData,
  PostFilter,
} from "@/types/community"

// ================== 投稿管理 ==================

/**
 * 投稿を作成
 */
export async function createPost(data: CreatePostData): Promise<string> {
  const postData: Omit<Post, "id"> = {
    ...data,
    likesCount: 0,
    likedBy: [],
    commentsCount: 0,
    isPinned: false,
    isArchived: false,
    viewsCount: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, "posts"), postData)
  return docRef.id
}

/**
 * 投稿を取得
 */
export async function getPost(postId: string): Promise<Post | null> {
  const docRef = doc(db, "posts", postId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  // 閲覧数をインクリメント
  await updateDoc(docRef, {
    viewsCount: increment(1),
  })

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Post
}

/**
 * 投稿一覧を取得
 */
export async function getPosts(
  filter?: PostFilter,
  limitCount: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ posts: Post[]; lastVisible: DocumentSnapshot | null }> {
  let q = query(
    collection(db, "posts"),
    where("isArchived", "==", false),
    orderBy("isPinned", "desc"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  )

  // フィルター適用
  if (filter?.category) {
    q = query(q, where("category", "==", filter.category))
  }
  if (filter?.authorId) {
    q = query(q, where("authorId", "==", filter.authorId))
  }
  if (filter?.organizationId) {
    q = query(q, where("organizationId", "==", filter.organizationId))
  }
  if (filter?.isPinned !== undefined) {
    q = query(q, where("isPinned", "==", filter.isPinned))
  }

  // ページネーション
  if (lastDoc) {
    q = query(q, startAfter(lastDoc))
  }

  const snapshot = await getDocs(q)
  const posts: Post[] = []

  snapshot.forEach((doc) => {
    posts.push({ id: doc.id, ...doc.data() } as Post)
  })

  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null

  return { posts, lastVisible }
}

/**
 * 投稿を更新
 */
export async function updatePost(
  postId: string,
  data: UpdatePostData
): Promise<void> {
  const docRef = doc(db, "posts", postId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

/**
 * 投稿を削除
 */
export async function deletePost(postId: string): Promise<void> {
  const docRef = doc(db, "posts", postId)
  await deleteDoc(docRef)

  // 関連するコメントも削除
  const commentsSnapshot = await getDocs(
    query(collection(db, "comments"), where("postId", "==", postId))
  )

  const deletePromises = commentsSnapshot.docs.map((doc) => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
}

/**
 * 投稿をピン留め/解除
 */
export async function togglePinPost(postId: string, isPinned: boolean): Promise<void> {
  const docRef = doc(db, "posts", postId)
  await updateDoc(docRef, { isPinned })
}

/**
 * 投稿をアーカイブ/解除
 */
export async function toggleArchivePost(
  postId: string,
  isArchived: boolean
): Promise<void> {
  const docRef = doc(db, "posts", postId)
  await updateDoc(docRef, { isArchived })
}

// ================== いいね機能 ==================

/**
 * 投稿にいいねする/解除する
 */
export async function toggleLikePost(
  postId: string,
  userId: string
): Promise<{ liked: boolean }> {
  const docRef = doc(db, "posts", postId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    throw new Error("投稿が見つかりません")
  }

  const post = docSnap.data() as Post
  const alreadyLiked = post.likedBy?.includes(userId) || false

  if (alreadyLiked) {
    // いいね解除
    await updateDoc(docRef, {
      likesCount: increment(-1),
      likedBy: arrayRemove(userId),
    })
    return { liked: false }
  } else {
    // いいねする
    await updateDoc(docRef, {
      likesCount: increment(1),
      likedBy: arrayUnion(userId),
    })
    return { liked: true }
  }
}

// ================== コメント機能 ==================

/**
 * コメントを作成
 */
export async function createComment(data: CreateCommentData): Promise<string> {
  const commentData: Omit<Comment, "id"> = {
    ...data,
    likesCount: 0,
    likedBy: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, "comments"), commentData)

  // 投稿のコメント数をインクリメント
  const postRef = doc(db, "posts", data.postId)
  await updateDoc(postRef, {
    commentsCount: increment(1),
  })

  return docRef.id
}

/**
 * 投稿のコメント一覧を取得
 */
export async function getComments(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db, "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  )

  const snapshot = await getDocs(q)
  const comments: Comment[] = []

  snapshot.forEach((doc) => {
    comments.push({ id: doc.id, ...doc.data() } as Comment)
  })

  return comments
}

/**
 * コメントを更新
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<void> {
  const docRef = doc(db, "comments", commentId)
  await updateDoc(docRef, {
    content,
    updatedAt: Timestamp.now(),
  })
}

/**
 * コメントを削除
 */
export async function deleteComment(
  commentId: string,
  postId: string
): Promise<void> {
  const docRef = doc(db, "comments", commentId)
  await deleteDoc(docRef)

  // 投稿のコメント数をデクリメント
  const postRef = doc(db, "posts", postId)
  await updateDoc(postRef, {
    commentsCount: increment(-1),
  })
}

/**
 * コメントにいいねする/解除する
 */
export async function toggleLikeComment(
  commentId: string,
  userId: string
): Promise<{ liked: boolean }> {
  const docRef = doc(db, "comments", commentId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    throw new Error("コメントが見つかりません")
  }

  const comment = docSnap.data() as Comment
  const alreadyLiked = comment.likedBy?.includes(userId) || false

  if (alreadyLiked) {
    // いいね解除
    await updateDoc(docRef, {
      likesCount: increment(-1),
      likedBy: arrayRemove(userId),
    })
    return { liked: false }
  } else {
    // いいねする
    await updateDoc(docRef, {
      likesCount: increment(1),
      likedBy: arrayUnion(userId),
    })
    return { liked: true }
  }
}
