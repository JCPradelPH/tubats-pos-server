import * as inventoryTriggers from './inventory';
import * as unitOfMeasurementTriggers from './unit_of_measurements';
import * as itemMenuTriggers from './item_menus';
import * as menuCategoryTriggers from './menu_categories';
import * as orderItemTriggers from './order_items';
import * as expensesAndUtilitiesTriggers from './expenses_and_utilities';
import * as httpServices from './services';

export const inventory = inventoryTriggers;
export const unit_of_measurements = unitOfMeasurementTriggers;
export const item_menus = itemMenuTriggers;
export const menu_categories = menuCategoryTriggers;
export const order_items = orderItemTriggers;
export const expenses_and_utilities = expensesAndUtilitiesTriggers;
export const services = httpServices;

