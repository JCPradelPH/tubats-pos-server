import * as functions from 'firebase-functions';
import { setParentNameToChild } from './utils';

export const onCreate = functions.firestore
    .document(`inventory/{inventoryRows}`)
    .onCreate(async (snap: FirebaseFirestore.DocumentSnapshot, context) => {
        const data: FirebaseFirestore.DocumentData | undefined = snap.data();
        const id: string = data!.id;
        const unitId: string = data!.unitId;

        const stock: string = data!.stock;
        const minimumStockAllowed: string = data!.minimumStockAllowed;
        const isLowOnStock: boolean = stock <= minimumStockAllowed;

        await snap.ref.update({ isLowOnStock })

        try {
            return setParentNameToChild(unitId, "unit_of_measurements", id, "inventory", "unitName");
        } catch (error) {
            console.log('inventory create trigger error');
            console.log(error);
            return;
        }
    });

export const onUpdate = functions.firestore
    .document(`inventory/{inventoryRows}`)
    .onUpdate(async (change: functions.Change<FirebaseFirestore.DocumentSnapshot>, context) => {
        const data: FirebaseFirestore.DocumentData | undefined = change.after.data();
        // const prevData: FirebaseFirestore.DocumentData | undefined = change.before.data();
        // const prevName: string = prevData!.name;
        const id: string = data!.id;
        const unitId: string = data!.unitId;
        const stock: string = data!.stock;
        const minimumStockAllowed: string = data!.minimumStockAllowed;
        const isLowOnStock: boolean = stock <= minimumStockAllowed;

        await change.after.ref.update({ isLowOnStock })

        try {
            return setParentNameToChild(unitId, "unit_of_measurements", id, "inventory", "unitName");
        } catch (error) {
            console.log('inventory update trigger error');
            console.log(error);
            return;
        }

    });