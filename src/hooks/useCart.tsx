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

      const stockedProduct= await api.get(`stock/${productId}`);

      const qtyProductIdinCart = cart.reduce(
        (acc, p) =>{

          if(p.id === productId) acc++;
          return acc

        },0
      );


      if(!stockedProduct) throw 1 ;

      if(stockedProduct.data.amount <= 0) throw 2 ;

      const updatedCart = [...cart, newProduct.data ]

      setCart(updatedCart as Product[]);

      localStorage.setItem('@RocketShoes:cart' , JSON.stringify(updatedCart));

      await updateProductAmount({ productId: productId, amount: stockedProduct.data.amount-1});
        
        
      } catch {
        if(1) toast.error('Erro na adição do produto');
        if(2) toast.error('Quantidade solicitada fora de estoque');
      }
  };
    
  const removeProduct = async(productId: number) => {//async
    try {
      // TODO

      const newProduct = await api.get(`products/${productId}`);
      const  stockedProduct=  await api.get(`stock/${productId}`);

      const cartData = localStorage.getItem('@RocketShoes:cart');

      const parsedCart: Product[] = cartData? JSON.parse(cartData) : [] as unknown as Product;

      console.log(parsedCart)

      if(!(cart.filter( p => p.id === productId)))  throw 3 ;
      // if(stockedProduct.data.amount <= 0) throw 4 ;



      const updatedCart = cart.filter(product => product.id !== productId);
      
      setCart(updatedCart as Product[]);
      
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

      const qtyProductIdinCart = cart.reduce((acc, p) =>{

        if(p.id === productId) acc++;

        return acc
      
        },0
      );

      await updateProductAmount({ productId: productId, amount: stockedProduct.data.amount+ qtyProductIdinCart});


    } catch {
      // TODO
      if(3) toast.error('Erro na remoção do produto');
      if(4) toast.error('Quantidade solicitada fora de estoque');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      
      const stockedProduct = await api.get(`stock/${productId}`);

      const storagedProducts = localStorage.getItem('@RocketShoes:cart');
      
      if(!stockedProduct) throw 5;
      if(stockedProduct.data.amount < 0) throw  6;

      await api.put(`stock/${productId}`,{amount: amount});

    } catch(e) {
      // TODO
      
      if(5)toast.error('Erro na alteração de quantidade do produto');
      if (6) toast.error('Quantidade solicitada fora de estoque');

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
