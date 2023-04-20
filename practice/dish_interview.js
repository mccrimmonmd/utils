/*
1. Write a function to return the total amount of cakes in stock
2. I need to make a grocery list of the unique toppings for cakes I am making.
Please write a function that returns an object where the keys are each topping,
and the values are the amount of that topping I need to buy

## Answers:

59

{
  'dutch process cocoa': 1,
  'toasted sugar': 3,
  'smoked sea salt': 3,
  berries: 2,
  'edible flowers': 2,
  mint: 1,
  cranberry: 1,
  'crystallized ginger': 2
}
*/

let amountInStock = (cakes) =>
  cakes.reduce((total, cake) => total + cake.inStock, 0);

let groceryList = (cakes) =>
  cakes.reduce((list, cake) => {
    cake.toppings.forEach(topping => {
      if (list.hasOwnProperty(topping))
        list[topping] += 1;
      else
        list[topping] = 1;
    });
    return list;
  }, 
  {});

const cakes = [
  {
    cakeFlavor: 'dark chocolate',
    filling: null,
    frosting: 'dark chocolate ganache',
    toppings: ['dutch process cocoa', 'toasted sugar', 'smoked sea salt'],
    inStock: 15,
  },
  {
    cakeFlavor: 'yellow',
    filling: 'citrus glaze',
    frosting: 'chantilly cream',
    toppings: ['berries', 'edible flowers'],
    inStock: 14,
  },
  {
    cakeFlavor: 'white chiffon',
    filling: 'mint and sage drizzle',
    frosting: 'whipped sweet cream',
    toppings: ['mint', 'cranberry', 'edible flowers'],
    inStock: 0,
  },
  {
   cakeFlavor: 'butter rum',
   filling: 'ginger cardamom swirl',
   frosting: 'spiced rum glaze',
   toppings: ['crystallized ginger', 'toasted sugar'],
   inStock: 9,
 },
 {
   cakeFlavor: 'vanilla',
   filling: 'St Germaine',
   frosting: 'whipped cream',
   toppings: ['smoked sea salt', 'crystallized ginger', 'berries'],
   inStock: 21,
 },
 {
    cakeFlavor: 'honey',
    filling: 'chocolate and cayenne',
    frosting: 'chocolate buttercream',
    toppings: ['smoked sea salt', 'toasted sugar'],
    inStock: 0,
  },
];

console.log(amountInStock(cakes));
console.log(groceryList(cakes));
