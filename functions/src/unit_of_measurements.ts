import * as functions from 'firebase-functions';
import { updateParentNameFromChildren } from './utils';

export const onUpdate = functions.firestore
    .document(`unit_of_measurements/{unitRows}`)
    .onUpdate(async (change: functions.Change<FirebaseFirestore.DocumentSnapshot>, context) => {
        const data: FirebaseFirestore.DocumentData | undefined = change.after.data();
        const prevData: FirebaseFirestore.DocumentData | undefined = change.before.data();
        const id: string = data!.id;
        const name: string = data!.name;
        const prevName: string = prevData!.name;

        try {
            if (name !== prevName) {
                return updateParentNameFromChildren(id, name, "inventory", "unitName", "unitId");
            }
            return null

        } catch (error) {
            console.log('unit of measurements update trigger error');
            console.log(error);
            return;
        }

    });