import React, { useState } from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: 1;
}

const Cart = (): JSX.Element => {

  const { cart, removeProduct, updateProductAmount } = useCart();

  

  const [cartFormatted,setCartformated]  = useState( cart.map(product => {
    
    // TODO
        product.amount =1;
        return {
              ...product,
              priceFormatted: formatPrice(product.price),
              subtotal: product.price * product.amount

            }
     
}));

  let total =
    formatPrice(
      cartFormatted.reduce((sumTotal, product) => {
        // TODO

          return sumTotal += product.subtotal;

      }, 0)
    )

  function handleProductIncrement(product: Product) {
    // TODO

    const updateCart = cartFormatted.map(pr =>  {

      if ( pr.id === product.id){  
          
        pr.amount+=1
        pr.subtotal= pr.price*pr.amount;
      
      };
      return pr;
    });


      setCartformated(updateCart);
    

      updateProductAmount({productId:product.id, amount: product.amount});

  }

  function handleProductDecrement(product: Product) {
    // TODO
    product.amount-=1
    

    // updateProductAmount({productId:product.id, amount: product.amount});

  }

  function handleRemoveProduct(productId: number) {
    // TODO

    const updatedCart = cartFormatted.filter(pd => pd.id !== productId);
    setCartformated(updatedCart);

    removeProduct(productId);

  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>

          {
            cartFormatted.map(product => (
              <tr data-testid="product" key={product.id}>
                <td>
                  <img src={product.image} alt={product.title} />
                </td>
                <td>
                  <strong>{product.title}</strong>
                  <span>{product.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={product.amount <= 1}
                      onClick={() => handleProductDecrement(product as Product)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={product.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(product as Product)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{formatPrice(product.subtotal)}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                  onClick={() => handleRemoveProduct(product.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>

            ))
          }

        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
