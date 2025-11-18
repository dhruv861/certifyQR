'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Query,
  DocumentData,
  Firestore,
  CollectionReference,
} from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import type { Certificate } from '@/lib/types';

// Define a generic type for the hook's return value
interface UseCollectionReturn<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
}

export function useCollection<T extends DocumentData>(
  collectionName: string
): UseCollectionReturn<T> {
  const { firestore } = useFirebase();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const collectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, collectionName) as CollectionReference<T>;
  }, [firestore, collectionName]);

  useEffect(() => {
    if (!collectionRef) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ ...doc.data(), id: doc.id });
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching collection ${collectionName}:`, err);
        setError('Failed to fetch data. You may not have permission.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionRef, collectionName]);

  return { data, loading, error };
}
