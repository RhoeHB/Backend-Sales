"use strict";

enum BuyerStatus{
  Regular = 'regular',
  Vip = 'vip',
  Wholesale = 'wholesale'
}

enum ProductType{
  Hats = 'Hats',
  Tops = 'Tops',
  Shorts = 'Shorts'
}

var products: Product[] = [
  {
    name: "oval hat",
    type: ProductType.Hats,
    price: {
      priceRegular: 1000,
      priceVip: 900,
      priceWholesale: 800
      }
  }, {
    name: "square hat",
    type: ProductType.Hats,
    price: {
      priceRegular: 1500,
      priceVip: null,
      priceWholesale: 1150
    }
  },{
    name: "magic shirt",
    type: ProductType.Tops,
    price: {
      priceRegular: 1000,
      priceVip:900,
      priceWholesale: null
    }
  },{
    name: "green short",
    type: ProductType.Shorts,
    price: {
      priceRegular: 1000,
      priceVip: null,
      priceWholesale: null
    }
  }
]

var buyers: Buyer[] = [
  {
    name: "Flan Hecson",
    status: BuyerStatus.Vip
  },{
    name: "Ani",
    status: BuyerStatus.Regular
  },{
    name: "Budi",
    status: BuyerStatus.Wholesale
  },
  {
    name: "Charlie",
    status: BuyerStatus.Vip
  }
]

class Buyer {
  public readonly name: string;
  public status: BuyerStatus;

  public constructor(name: string, status: BuyerStatus) {
    this.name = name;
    this.status = status;
  }
}

class Transaction {
  public readonly item: Product;
  public qty: number
  public buyer: Buyer;
  public total: number;

  public constructor(item: Product, qty: number, buyer: Buyer) {
    this.item = item;
    this.qty = qty;
    this.buyer = buyer;
    this.total = qty * this.getPrice();
  }

  private getPrice(): number{
    switch(this.buyer.status) { 
      case BuyerStatus.Regular: { 
         return this.item.price.priceRegular
      } 
      case BuyerStatus.Vip: { 
        return this.item.price.priceVip ? this.item.price.priceVip : this.item.price.priceRegular 
      } 
      case BuyerStatus.Wholesale: { 
        return this.item.price.priceWholesale ? this.item.price.priceWholesale : this.item.price.priceRegular 
     } 
      default: { 
        return this.item.price.priceRegular 
      } 
    } 
  }
}

class Price {
  public constructor(public priceRegular: number, public priceVip: number | null,public priceWholesale: number | null) {
  }
}

class Product {
  public constructor(public name: string,public type: ProductType,public price: Price) {
  }
}

interface Summary{
  totalTransaction: number,
  bestSellingItem: string | null,
  bestSellingCategory: ProductType,
  rpc: CategoryRevenue[],
  revenue: number,
  bestSpenders: Spenders[]
}

var transactionList: Transaction[] = []

transactionList.push(new Transaction(products[0], 10, buyers[0]))
transactionList.push(new Transaction(products[1], 5, buyers[1]))
transactionList.push(new Transaction(products[2], 3, buyers[2]))
transactionList.push(new Transaction(products[3], 11, buyers[3]))

function max_of_three(x: number, y: number, z: number) 
{
 let max_val = 0;
 let category: ProductType;

 if (x > y)
 {
   max_val = x;
  category = ProductType.Hats
 } else
 {
   max_val = y;
   category = ProductType.Tops
 }
 if (z > max_val) 
 {
   max_val = z;
   category = ProductType.Shorts
 }
 return category;
}

interface ProductQty{
  product: Product,
  qty: number,

}

interface CategoryRevenue{
  category: ProductType,
  revenue: number,
}

interface Spenders{
  name: string,
  type: BuyerStatus,
  spent: number,
}

// check if product exist
function addProduct(product : Product){
  var indexItem = products.findIndex(existingProduct => existingProduct.name === product.name) 
  if (indexItem === -1){
    products.push(product)
  }else{
    console.error('Product Exists')
  }
}

// check if buyer exist
function addBuyer(buyer : Buyer){
  var indexItem = buyers.findIndex(existingBuyer => existingBuyer.name === buyer.name) 
  if (indexItem === -1){
    buyers.push(buyer)
  }else{
    console.error('Buyer Exists')
  }

}

function compareNumbers(a: number, b: number) {
  return a - b;
}


function generateSummary(transactionList: Transaction[]){
  
  // no need to check if price regular is null because priceRegular does not allow null

  // check best selling item
  var productQtyList: ProductQty[] = []
  for (var i of transactionList){
    let indexItem = productQtyList.findIndex(productQty => productQty.product.name === i.item.name) 
    if (indexItem !== -1){
      productQtyList[indexItem].qty += i.qty
    }else{
      productQtyList.push({product: i.item, qty: i.qty})
    }
  } 
  var mostItem = Math.max(...productQtyList.map(item => item.qty))
  var bestSellingItem = productQtyList.find(item => item.qty === mostItem)
  
  // check best selling category
  let ht_total = 0
  let tp_total = 0
  let st_total = 0
  let category: ProductType
  for (var i of transactionList){
    switch(i.item.type) { 
      case ProductType.Hats: { 
         ht_total += i.qty;
         break;
      } 
      case ProductType.Tops: { 
        tp_total += i.qty;
        break;
      } 
      case ProductType.Shorts: { 
        st_total += i.qty;
        break;
     } 
      default: { 
        console.log('Type not defined')
      } 
    }  
  }

  category = max_of_three(ht_total, tp_total, st_total)

  //rpc
  var categRevenueList: CategoryRevenue[] = []
  for (var i of transactionList){
    let indexItem = categRevenueList.findIndex(categRevenue => categRevenue.category === i.item.type) 
    if (indexItem !== -1){
      categRevenueList[indexItem].revenue += i.total
    }else{
      categRevenueList.push({category: i.item.type, revenue: i.total})
    }
  } 
  console.log(categRevenueList);

  // revenue
  var totalRev: number = 0
  for (let i of categRevenueList){
    totalRev += i.revenue;
  }

  // best Spender
  var spenderList: Spenders[] = []
  for (var i of transactionList){
    let indexItem = spenderList.findIndex(spender => spender.name === i.buyer.name) 
    if (indexItem !== -1){
      spenderList[indexItem].spent += i.total
    }else{
      spenderList.push({name: i.buyer.name, type: i.buyer.status, spent: i.total})
    }
  } 
  var topSpender = spenderList.sort((a: Spenders,b: Spenders)=> b.spent - a.spent).slice(0, 3)

  var summary : Summary = {
    totalTransaction: transactionList.length,
    bestSellingItem: bestSellingItem ? bestSellingItem.product.name : null,
    bestSellingCategory: category,
    rpc: categRevenueList,
    revenue: totalRev,
    bestSpenders: topSpender
   }
   console.log(summary)
}

var test_add_product: Product = {
  name: "oval hat",
  type: ProductType.Hats,
  price: {
    priceRegular: 1000,
    priceVip: 900,
    priceWholesale: 800
    }
}
addProduct(test_add_product)

var test_add_buyer: Buyer ={
  name: "Flan Hecson",
  status: BuyerStatus.Vip
}
addBuyer(test_add_buyer)

generateSummary(transactionList)

//Hero Hartanto Bonarda
//herohartanto@gmail.com
