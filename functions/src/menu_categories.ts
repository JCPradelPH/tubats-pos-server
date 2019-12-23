import * as functions from 'firebase-functions';
import { updateParentNameFromChildren } from './utils';

export const onUpdate = functions.firestore
    .document(`menu_categories/{rows}`)
    .onUpdate(async (change: functions.Change<FirebaseFirestore.DocumentSnapshot>, context) => {
        const data: FirebaseFirestore.DocumentData | undefined = change.after.data();
        const prevData: FirebaseFirestore.DocumentData | undefined = change.before.data();
        const id: string = data!.id;
        const name: string = data!.name;
        const prevName: string = prevData!.name;

        try {
            if (name !== prevName) {
                return updateParentNameFromChildren(id, name, "item_menus", "categoryName", "categoryId");
            }
            return null

        } catch (error) {
            console.log('menu_categories update trigger error');
            console.log(error);
            return;
        }

    });