import * as functions from 'firebase-functions';
import { firebaseAdmin, FieldValue } from './utils';

export const onCreate = functions.firestore
    .document(`orders/{orderRows}/order_items/{orderItemRows}`)
    .onCreate(async (snap: FirebaseFirestore.DocumentSnapshot, context) => {
        const data: FirebaseFirestore.DocumentData | undefined = snap.data();
        const menuItemId: string = data!.itemId;
        const menuInventoryItems = data!.menuInventoryItems;
        const cmonth = new Date().getMonth().toString();
        const cdate = new Date().getDate().toString();
        const cyear = new Date().getFullYear().toString();
        const dailyOrdersIdFormat = `${cdate}-${cmonth}-${cyear}`;

        try {
            const menuItemRef: FirebaseFirestore.DocumentReference = firebaseAdmin.firestore()
                .collection('item_menus')
                .doc(menuItemId);
            const dailyOrdersRef: FirebaseFirestore.DocumentReference = menuItemRef
                .collection('daily_orders')
                .doc(dailyOrdersIdFormat);
            // const dailyOrdersSnap: FirebaseFirestore.DocumentSnapshot = await dailyOrdersRef.get();
            // if (dailyOrdersSnap.exists) {
            //     await dailyOrdersRef.update({ orderCount: FieldValue.increment(1), })
            // } else {
            //     await dailyOrdersRef.create({ orderCount: FieldValue.increment(1), })
            // }
            await dailyOrdersRef.set({ orderCount: FieldValue.increment(1), merge: true })
            
            await menuItemRef.update({ orderCount: FieldValue.increment(1), })
            
            const updateTrans = [];
            (<any>Symbol).asyncIterator = Symbol.for("Symbol.asyncIterator");
            for await (const inventoryItem of menuInventoryItems) {
                const inventoryRef: FirebaseFirestore.DocumentReference = firebaseAdmin.firestore()
                    .collection('inventory')
                    .doc(inventoryItem['inventoryItemId']);
                const item = await inventoryRef.get();
                const stock = item!.data()!["stock"] - inventoryItem['quantity'];
                updateTrans.push(inventoryRef.update({ stock }))
            }
            return Promise.all(updateTrans);
        } catch (error) {
            console.log('item_menus create trigger error');
            console.log(error);
            return;
        }
    });