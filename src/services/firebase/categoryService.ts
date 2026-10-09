/**
 * FUNDECHO - CATEGORY SERVICE (FIRESTORE)
 * Production database integration for funding catalog categories.
 * Persistent across sessions and devices via Firestore collection "categories".
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { Category } from '../../types';
import { CATEGORIES_DATA } from '../../data/categories';
import { handleFirestoreError } from './firestoreService';
import { FIRESTORE_COLLECTIONS } from '../../types/firebase';

const COLLECTION_NAME = FIRESTORE_COLLECTIONS.CATEGORIES || 'categories';

/**
 * Initializes default categories in Firestore if the collection is empty.
 */
export async function seedCategoriesIfEmpty(): Promise<number> {
  if (!isFirebaseConfigured()) return 0;

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return 0;
    }

    const batch = writeBatch(db);
    let count = 0;

    for (const cat of CATEGORIES_DATA) {
      const docRef = doc(db, COLLECTION_NAME, cat.id);
      batch.set(docRef, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon || 'Briefcase',
        accentColor: cat.accentColor || 'bg-indigo-500',
        count: cat.count || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      count++;
    }

    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, 'create', COLLECTION_NAME);
    return 0;
  }
}

/**
 * Fetches all categories directly from the Firestore collection.
 */
export async function fetchCategoriesFromFirestore(): Promise<Category[]> {
  if (!isFirebaseConfigured()) {
    return CATEGORIES_DATA;
  }

  try {
    const colRef = collection(db, COLLECTION_NAME);
    let snap = await getDocs(colRef);

    if (snap.empty) {
      await seedCategoriesIfEmpty();
      snap = await getDocs(colRef);
    }

    if (snap.empty) {
      return CATEGORIES_DATA;
    }

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || 'Unnamed Category',
        slug: data.slug || d.id,
        description: data.description || '',
        icon: data.icon || 'Briefcase',
        accentColor: data.accentColor || 'bg-indigo-500',
        count: typeof data.count === 'number' ? data.count : (typeof data.opportunityCount === 'number' ? data.opportunityCount : 0),
      } as Category;
    });
  } catch (error) {
    handleFirestoreError(error, 'list', COLLECTION_NAME);
    return CATEGORIES_DATA;
  }
}

/**
 * Creates or updates a category in Firestore.
 */
export async function saveCategoryToFirestore(category: Category): Promise<void> {
  if (!isFirebaseConfigured() || !category.id) return;

  try {
    const docRef = doc(db, COLLECTION_NAME, category.id);
    await setDoc(docRef, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon || 'Briefcase',
      accentColor: category.accentColor || 'bg-indigo-500',
      count: category.count || 0,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, 'update', `${COLLECTION_NAME}/${category.id}`);
    throw error;
  }
}

/**
 * Deletes a category from Firestore.
 */
export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  if (!isFirebaseConfigured() || !categoryId) return;

  try {
    const docRef = doc(db, COLLECTION_NAME, categoryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `${COLLECTION_NAME}/${categoryId}`);
    throw error;
  }
}
