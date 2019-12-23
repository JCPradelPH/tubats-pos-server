import * as functions from 'firebase-functions';
import { firebaseAdmin } from './utils';

export const onCreate = functions.firestore
    .document(`expenses_and_utilities/{rows}`)
    .onCreate(async (snap: FirebaseFirestore.DocumentSnapshot, context) => {
        const data: FirebaseFirestore.DocumentData | undefined = snap.data();
        const expenseCategoryId: string = data!.expenseCategoryId;
        const inventoryCategoryId: string = 'tSvxtv8qLvZ8XxD8Ykqq';
        const isInventory: boolean = expenseCategoryId === inventoryCategoryId;
        try {
            if (isInventory) {
                const inventoryRef: FirebaseFirestore.DocumentReference = firebaseAdmin.firestore()
                    .collection('inventory')
                    .doc(data!.inventoryItemId);
                const inventoryData: FirebaseFirestore.DocumentSnapshot = await inventoryRef.get()
                const inventoryItemQuantity: number = data!.inventoryItemQuantity;
                const inventoryStock: number = inventoryData!.data()!['stock'] + inventoryItemQuantity;
                return inventoryRef.update({ stock: inventoryStock })
            }
            return null;
        } catch (error) {
            console.log('expenses_and_utilities create trigger error');
            console.log(error);
            return;
        }
    });

export const onUpdate = functions.firestore
    .document(`expenses_and_utilities/{rows}`)
    .onUpdate(async (change: functions.Change<FirebaseFirestore.DocumentSnapshot>, context) => {
        const inventoryCategoryId: string = 'tSvxtv8qLvZ8XxD8Ykqq';
        const newData: FirebaseFirestore.DocumentData | undefined = change.after.data();
        const prevData: FirebaseFirestore.DocumentData | undefined = change.before.data();
        const newExpenseCategoryId: string = newData!.expenseCategoryId;
        // const prevExpenseCategoryId: string = prevData!.expenseCategoryId;
        const prevQuantity: number = prevData!.inventoryItemQuantity;
        const newQuantity: number = newData!.inventoryItemQuantity;
        const isInventoryNew: boolean = newExpenseCategoryId === inventoryCategoryId;
        // const isInventoryPrev: boolean = prevExpenseCategoryId === inventoryCategoryId;

        try {
            // if (isInventoryPrev && newQuantity !== prevQuantity) {
            //     const prevInventoryRef: FirebaseFirestore.DocumentReference = firebaseAdmin.firestore()
            //         .collection('inventory')
            //         .doc(prevData!.inventoryItemId);
            //     const prevInventoryData: FirebaseFirestore.DocumentSnapshot = await prevInventoryRef.get()
            //     const inventoryItemQuantity: number = prevData!.inventoryItemQuantity;
            //     const inventoryStock: number = prevInventoryData!.data()!['stock'] - inventoryItemQuantity;
            //     await prevInventoryRef.update({ stock: inventoryStock })
            // }
            if (isInventoryNew && newQuantity !== prevQuantity) {
                const newInventoryRef: FirebaseFirestore.DocumentReference = firebaseAdmin.firestore()
                    .collection('inventory')
                    .doc(newData!.inventoryItemId);
                const newInventoryData: FirebaseFirestore.DocumentSnapshot = await newInventoryRef.get()
                const inventoryStock: number = (newInventoryData!.data()!['stock'] - prevQuantity) + newQuantity;
                return newInventoryRef.update({ stock: inventoryStock })
            }
            return null;
        } catch (error) {
            console.log('expenses_and_utilities update trigger error');
            console.log(error);
            return;
        }

    });

export const exportExpensesAndUtilities = functions.https.onRequest(async (req, res) => {
    const docsRef = firebaseAdmin.firestore().collection(`expenses_and_utilities`);

    try {
        const getDocs = await docsRef.get();
        const stringifiedData = JSON.stringify(getDocs.docs.map((doc) => doc.data()), null, 2);

        return res.send(stringifiedData);
    } catch (error) {
        console.log(`Logs OnCreate: Failed to update log`)
        console.log(error)
        return res.status(500).send({
            status: 'ERROR',
            rowCount: 0,
            msg: error,
        })
    }
})