import { doc, getDoc } from 'firebase/firestore';
import type { Certificate } from '@/lib/types';

/**
 * Search for a certificate in both test and production collections
 */
export async function findCertificateById(
  firestore: any,
  certificateId: string
): Promise<{ certificate: Certificate | null; collection: string | null }> {
  if (!firestore || !certificateId) {
    return { certificate: null, collection: null };
  }

  // Search in production collection first (iadc_certificates)
  try {
    const prodRef = doc(firestore, 'iadc_certificates', certificateId);
    const prodSnap = await getDoc(prodRef);
    
    if (prodSnap.exists()) {
      return {
        certificate: prodSnap.data() as Certificate,
        collection: 'iadc_certificates'
      };
    }
  } catch (error) {
    console.warn('Error searching in production collection:', error);
  }

  // Search in test collection if not found in production (certificates_test)
  try {
    const testRef = doc(firestore, 'certificates_test', certificateId);
    const testSnap = await getDoc(testRef);
    
    if (testSnap.exists()) {
      return {
        certificate: testSnap.data() as Certificate,
        collection: 'certificates_test'
      };
    }
  } catch (error) {
    console.warn('Error searching in test collection:', error);
  }

  return { certificate: null, collection: null };
}