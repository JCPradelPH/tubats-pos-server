import * as admin from 'firebase-admin'

export const firebaseAdmin = admin.initializeApp();
export const FieldValue = admin.firestore.FieldValue

export const setParentNameToChild = async (parentId: string, parentColName: string, childId: string, childColName: string, nameField: string) => {
    try {
        const parent: FirebaseFirestore.DocumentSnapshot = await firebaseAdmin.firestore()
            .collection(parentColName)
            .doc(parentId).get()
        const parentData: FirebaseFirestore.DocumentData | undefined = parent.data();
        const childRef: FirebaseFirestore.DocumentReference = firebaseAdmin.firestore().collection(childColName).doc(childId);

        return childRef.update({ [nameField]: parentData!.name });
    } catch (error) {
        console.log('setParentChildName error');
        console.log(error);
        return null;
    }
}

export const updateParentNameFromChildren = async (parentId: string, parentNewName: string, childColName: string, nameField: string, parentField: string) => {
    try {
        const children: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore()
            .collection(childColName)
            .where(parentField, "==", parentId)
            .get()
        if (children.docs.length === 0) return null;

        const updateOperations = children.docs.map(geo => geo.ref.update({ [nameField]: parentNewName }))

        return Promise.all(updateOperations);
    } catch (error) {
        console.log('setParentChildName error');
        console.log(error);
        return null;
    }
}

export const setQuote = async (quoteId: string, marginId: string, editMode: boolean = false): Promise<any> => {
    try {

        const baseAmount = 8;
        const margin: FirebaseFirestore.DocumentSnapshot = await firebaseAdmin.firestore()
            .collection("margins")
            .doc(marginId).get()
        const marginData: FirebaseFirestore.DocumentData | undefined = margin.data();
        const adminMargin = marginData!.isAdminMarginFixed ? marginData!.adminMargin :
            baseAmount * (marginData!.adminMargin / 100)

        let quoteAmount = baseAmount + adminMargin;
        const partnerMargin = marginData!.isPartnerMarginFixed ? marginData!.partnerMargin :
            quoteAmount * (marginData!.partnerMargin / 100)

        quoteAmount = quoteAmount + partnerMargin
        quoteAmount = Math.round(quoteAmount * 100) / 100

        const quoteRef: FirebaseFirestore.DocumentReference = firebaseAdmin.firestore().collection("quotes").doc(quoteId)
        const quoteData: object = {
            id: quoteId,
            partnerId: marginData!.partnerId,
            partnerName: marginData!.partnerName,
            marginId,
            productId: marginData!.productId,
            productName: marginData!.productName,
            lineId: marginData!.lineId,
            lineName: marginData!.lineName,
            quoteAmount
        }
        return editMode ? quoteRef.update(quoteData) : quoteRef.set(quoteData)
    } catch (error) {
        console.log('putQuote error');
        console.log(error);
        return null;
    }
}