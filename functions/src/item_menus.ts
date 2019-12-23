import * as functions from 'firebase-functions';
import { setParentNameToChild } from './utils';

export const onCreate = functions.firestore
    .document(`item_menus/{itemMenuRows}`)
    .onCreate(async (snap: FirebaseFirestore.DocumentSnapshot, context) => {
        const data: FirebaseFirestore.DocumentData | undefined = snap.data();
        const id: string = data!.id;
        const categoryId: string = data!.categoryId;

        try {
            return setParentNameToChild(categoryId, "menu_categories", id, "item_menus", "categoryName");
        } catch (error) {
            console.log('item_menus create trigger error');
            console.log(error);
            return;
        }
    });

export const onUpdate = functions.firestore
    .document(`item_menus/{itemMenuRows}`)
    .onUpdate(async (change: functions.Change<FirebaseFirestore.DocumentSnapshot>, context) => {
        const data: FirebaseFirestore.DocumentData | undefined = change.after.data();
        const id: string = data!.id;
        const categoryId: string = data!.categoryId;

        try {
            return setParentNameToChild(categoryId, "menu_categories", id, "item_menus", "categoryName");
        } catch (error) {
            console.log('item_menus update trigger error');
            console.log(error);
            return;
        }

    });