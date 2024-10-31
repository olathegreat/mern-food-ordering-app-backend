import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  
  console.log(typeof req.body); 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("error here", errors)
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};


export const validateMyUserRequest = [
    body('name').isString().notEmpty().withMessage('Name must be a string'),
    body('addressLine1').isString().notEmpty().withMessage('Address Line 1 must be a string'),  
    body('country').isString().notEmpty().withMessage('Country must be a string'),  
    body('city').isString().notEmpty().withMessage('City must be a string'),  
    handleValidationErrors,  

];

export const validateMyRestaurantRequest =[
  body('restaurantName').notEmpty().withMessage('Restaurant name is required'), 
  body('city').notEmpty().withMessage('City is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('deliveryPrice').isFloat({min:0}).withMessage('Delivery price must be a number'),
  body('estimatedDeliveryTime').isInt({min:0}).withMessage('Estimated delivery time must be a number'),
  // body('cuisines').isArray().withMessage('Cuisines must be an array').notEmpty(),
  // body('menuItems').isArray().withMessage('Menu items must be an array').notEmpty(),
  body('cuisines').custom(value => Array.isArray(value)).withMessage('Cuisines must be an array'),
body('menuItems').custom(value => {
    if (typeof value === 'string') {
        value = JSON.parse(value); // parse JSON string to array of objects
    }
    if (!Array.isArray(value)) {
        throw new Error('Menu items must be an array');
    }
    value.forEach(item => {
        if (typeof item.name !== 'string' || item.name.trim() === '') {
            throw new Error('Each menu item must have a valid name');
        }
        if (isNaN(item.price) || item.price < 0) {
            throw new Error('Each menu item price must be a non-negative number');
        }
    });
    return true;
}),

  body('menuItems.*.name').isString().notEmpty().withMessage('Menu item name must be a string and is required'),
  body('menuItems.*.price').isFloat({min:0}).withMessage('Menu item price must be a number and is requuired'),
  handleValidationErrors,
]