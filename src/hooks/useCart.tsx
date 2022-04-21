import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {

    
   //Buscar dados do localStorage 
    const storagedCart = localStorage.getItem('@RocketShoes:cart');                    

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
        const newProduct = await api.get(`products/${productId}`);

        const storagedProducts = localStorage.getItem('@RocketShoes:cart');

        const parsedCart: Product[] = storagedProducts? JSON.parse(storagedProducts) : [];

        // const isProductInCart:boolean = parsedCart.filter(p => p.id === productId).length >0;

        const stockedProduct= await api.get(
          `stock/${productId}`,
        );

          const qtyProductIdinCart = cart.reduce(
          (acc, p) =>{

          if(p.id === productId){
          acc++;
          }
          return acc
          },0
          );

        // if(newProduct && stockedProduct.data.amount > 0){//&& !isProductInCart){

          
          // const parsedProduct:Product = JSON.parse(newProduct.data);


          // console.log(stockedProduct)
          
          const updatedCart = [...cart, newProduct.data ]
          
          
          
          setCart(updatedCart as Product[]);

          
          localStorage.setItem('@RocketShoes:cart' , JSON.stringify(updatedCart));

          updateProductAmount({ productId: productId, amount: stockedProduct.data.amount-1});
        // }else{
          // throw new Error;
        // }
        
      } catch {
        // TODO
        // toast.error('Quantidade solicitada fora de estoque');
        toast.error('Erro na adição do produto');
      }
    };
    
    const removeProduct = async(productId: number) => {//async
      try {
        // TODO

        const newProduct = await api.get(`products/${productId}`);
        const  stockedProduct=  await api.get(
          `stock/${productId}`,
        );

        // if(newProduct ){//&& !isProductInCart){

          const updatedCart = cart.filter(product => product.id !== productId);
          
          setCart(updatedCart as Product[]);
          
          localStorage.setItem('@RocketShoes:cart' , JSON.stringify(updatedCart));

          const qtyProductIdinCart = cart.reduce(
            (acc, p) =>{
  
            if(p.id === productId){
            acc++;
            }
            return acc
            },0
            );

          updateProductAmount({ productId: productId, amount: stockedProduct.data.amount+ qtyProductIdinCart});
        // }else{
          // throw new Error;
        // }


        // toast.error('Quantidade solicitada fora de estoque');

    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      
      const stockedProduct: Stock = await api.get(
        `stock/${productId}`,
      );

      // const storagedProducts = localStorage.getItem('@RocketShoes:cart');


        // if(stockedProduct){

        //   if(stockedProduct.amount > 0 &&  amount <= stockedProduct.amount){
            await api.put(`stock/${productId}`,{amount: amount});
        //   }else{
        //     throw new Error;
        //   }

        // }else{
        //   throw new Error;
        // }


        
        
        
        // console.log(response.data);
        // if(response.data.amount >= amount){
          // localStorage.setItem('@RocketShoes:cart' , JSON.stringify(cart));
          // await api.put(`stock/${productId}`,{amount: amount});
        // setCart(cart);
      // }else{
      //   throw new Error;
      // }

    } catch {
      // TODO

      
      toast.error('Erro na alteração de quantidade do produto');
      //'Quantidade solicitada fora de estoque'

    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
