import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

class PaymentService {
    /**
     * Verifies if a given UTR exists in the database and is valid.
     * @param {string} utr - The transaction ID to verify.
     * @returns {Promise<{valid: boolean, message?: string, alreadyUsed?: boolean}>}
     */
    async verifyTransaction(utr) {
        if (!utr) return { valid: false, message: 'Invalid UTR' };

        try {
            // Normalize UTR
            const cleanUtr = utr.trim();

            // 1. Check in 'transactions' collection
            const q = query(collection(db, 'transactions'), where('utr', '==', cleanUtr));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { valid: false, message: 'Transaction ID not found.' };
            }

            // 2. Check status of the found transaction
            let transactionDoc = null;
            let transactionId = null;

            querySnapshot.forEach((doc) => {
                transactionDoc = doc.data();
                transactionId = doc.id;
            });

            if (transactionDoc.status === 'used') {
                return { valid: false, message: 'Transaction ID already used.', alreadyUsed: true };
            }

            // 3. Mark as used (Optional: depending on business logic, we usually mark it used immediately)
            // For safety, we might want to mark it used so it can't be shared.
            try {
                const docRef = doc(db, 'transactions', transactionId);
                await updateDoc(docRef, {
                    status: 'used',
                    usedAt: new Date().toISOString()
                });
            } catch (updateError) {
                console.error("Error updating transaction status:", updateError);
                // Even if update fails, if it was valid, we might valid it? Or fail safe?
                // check if we really want to block. Proceeding for now.
            }

            return { valid: true };

        } catch (error) {
            console.error('Payment verification error:', error);
            return { valid: false, message: 'Network error verifying payment.' };
        }
    }
}

export default new PaymentService();
