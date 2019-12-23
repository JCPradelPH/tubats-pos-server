import * as functions from 'firebase-functions';
import { firebaseAdmin } from './utils';

// https://us-central1-tubats-restobar-pos.cloudfunctions.net/services-computeTotal
export const computeTotal = functions.https.onRequest(async (req, res) => {
    const collectionName = req.query.collectionName
    const fieldTotal = req.query.fieldTotal
    try {
        const collection: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore().collection(collectionName).get();
        const total: number = collection.docs.reduce((val = 0, doc) => {
            const totalVal: number = val + doc.data()[fieldTotal];
            return totalVal;
        }, 0);
        return res.send({
            status: 'OK',
            collection: collectionName,
            total
        })
    } catch (error) {
        console.log(`computeTotal service error`)
        console.log(error)
        return res.status(500).send({
            status: 'ERROR',
            rowCount: 0,
            msg: error,
        })
    }
})

// https://us-central1-tubats-restobar-pos.cloudfunctions.net/services-computeExpensesByRecurring
export const computeExpensesByRecurring = functions.https.onRequest(async (req, res) => {
    try {
        const recurring_cat: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore().collection('recurring_expenses').get();
        const expenses: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore().collection('expenses_and_utilities').get();
        const result: Object[] = recurring_cat.docs.map(cat => {
            const fExpenses: FirebaseFirestore.QueryDocumentSnapshot[] = expenses.docs
                .filter(exp => exp.data()['recurringExpenseId'] === cat.data()['id'])
            const total: number = fExpenses.reduce((val = 0, doc) => {
                const totalVal: number = val + doc.data()['amount'];
                return totalVal;
            }, 0)
            return {
                [cat.data()['name']]: total
            }

        });
        return res.send({
            status: 'OK',
            result
        })
    } catch (error) {
        console.log(`computeExpensesByRecurring service error`)
        console.log(error)
        return res.status(500).send({
            status: 'ERROR',
            msg: error,
        })
    }
})

// https://us-central1-tubats-restobar-pos.cloudfunctions.net/services-computeExpensesByCategory
export const computeExpensesByCategory = functions.https.onRequest(async (req, res) => {
    try {
        const exp_cat: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore().collection('expense_categories').get();
        const expenses: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore().collection('expenses_and_utilities').get();
        const result: Object[] = exp_cat.docs.map(cat => {
            const fExpenses: FirebaseFirestore.QueryDocumentSnapshot[] = expenses.docs
                .filter(exp => exp.data()['expenseCategoryId'] === cat.data()['id'])
            const total: number = fExpenses.reduce((val = 0, doc) => {
                const totalVal: number = val + doc.data()['amount'];
                return totalVal;
            }, 0)
            return {
                [cat.data()['name']]: total
            }

        });
        return res.send({
            status: 'OK',
            result
        })
    } catch (error) {
        console.log(`computeExpensesByCategory service error`)
        console.log(error)
        return res.status(500).send({
            status: 'ERROR',
            msg: error,
        })
    }
})

// https://us-central1-tubats-restobar-pos.cloudfunctions.net/services-listExpensesByCategory
// C1Vh5cszcq7qb8p2cT9l - Recurring Expenses
// tSvxtv8qLvZ8XxD8Ykqq - Inventory
// uJjV12p2ornYZhNvYA8Y - Others
export const listExpensesByCategory = functions.https.onRequest(async (req, res) => {
    try {
        const categoryId = req.query.categoryId
        const expenses: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore().collection('expenses_and_utilities')
            .where('expenseCategoryId', '==', categoryId)
            .get();
        const result: Object[] = expenses.docs.map(expense => {
            return {
                [expense.data()['name']]: expense.data()['amount']
            }
        });
        return res.send({
            status: 'OK',
            result
        })
    } catch (error) {
        console.log(`listExpensesByCategory service error`)
        console.log(error)
        return res.status(500).send({
            status: 'ERROR',
            msg: error,
        })
    }
})

// https://us-central1-tubats-restobar-pos.cloudfunctions.net/services-updateOrders
export const updateOrders = functions.https.onRequest(async (req, res) => {
    try {
        const orders: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore().collection('orders').get();
        (<any>Symbol).asyncIterator = Symbol.for("Symbol.asyncIterator");
        for await (const order of orders.docs) {
            const orderItems: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore()
                .collection('orders')
                .doc(order.data()['id'])
                .collection('order_items')
                .get();
            for await (const orderItem of orderItems.docs) {
                const parentOrderItem: FirebaseFirestore.DocumentSnapshot = await firebaseAdmin.firestore()
                    .collection('item_menus')
                    .doc(orderItem.data()['itemId'])
                    .get();
                await orderItem.ref.update({...parentOrderItem.data()})
            }
        }
        return res.send({
            status: 'OK',
        })
    } catch (error) {
        console.log(`updateOrders service error`)
        console.log(error)
        return res.status(500).send({
            status: 'ERROR',
            msg: error,
        })
    }
})

// https://us-central1-tubats-restobar-pos.cloudfunctions.net/services-resetInventoryStocks
export const resetInventoryStocks = functions.https.onRequest(async (req, res) => {
    try {
        const inventories: FirebaseFirestore.QuerySnapshot = await firebaseAdmin.firestore()
            .collection('inventory')
            .get();
        (<any>Symbol).asyncIterator = Symbol.for("Symbol.asyncIterator");
        for await (const inventory of inventories.docs) {
            await inventory.ref.update({
                stock: 0,
                minimumStockAllowed: 0,
                isLowOnStock: true
            })
        }
        return res.send({ status: 'OK', })
    } catch (error) {
        console.log(`resetInventoryStocks service error`)
        console.log(error)
        return res.status(500).send({
            status: 'ERROR',
            msg: error,
        })
    }
})