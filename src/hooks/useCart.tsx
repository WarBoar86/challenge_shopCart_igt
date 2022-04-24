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
       
      const stockedProduct: Stock=  (await api.get(`stock/${productId}`)).data;

      if(!stockedProduct.id) throw new Error;


      const productInCart = cart.filter( p => p.id === productId);

      if(!productInCart[0]) {

        const newProduct = await api.get(`products/${productId}`);

        const updatedCart:Product[] = [...cart, {...newProduct.data, amount: 1} ];
      
        
        localStorage.setItem('@RocketShoes:cart' , JSON.stringify(updatedCart));
        setCart(updatedCart);
      
      } else{
        
        
        try {

           if(productInCart[0].amount + 1 >  stockedProduct.amount ) throw new Error;



          const updatedCart:Product[] = cart.map(p => {
              
              if(p.id === productId){

                p.amount+=1;
              
              }
              return p;
            });
            
          localStorage.setItem('@RocketShoes:cart' , JSON.stringify(updatedCart));
          setCart(updatedCart);

        } catch {
          toast.error('Quantidade solicitada fora de estoque');
        }
      } 
    } catch {
      
      toast.error('Erro na adição do produto');
    }
  };
    
  const removeProduct =(productId: number) => {
    try {
      // TODO
      

      const productInCart=  cart.filter( p => p.id === productId);

      if(productInCart[0].id === productId) {

        const updatedCart = cart.filter(product => product.id !== productId);
      
        localStorage.setItem('@RocketShoes:cart' , JSON.stringify(updatedCart));
        setCart(updatedCart);

      }else { 
        throw new Error;
      }

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
      
      const stockedProduct: Stock= (await api.get(`stock/${productId}`)).data;

      if(!stockedProduct.id) throw new Error;

      try{

        if(amount < 1 || amount > stockedProduct.amount) throw new Error;  
      const updatedCart = cart.map( p =>{
        
        if (p.id === productId) {
          p.amount = amount;
        } 

        return p;
      
      });
     
      localStorage.setItem('@RocketShoes:cart' , JSON.stringify(updatedCart));
      setCart(updatedCart);
      }catch{
        toast.error('Quantidade solicitada fora de estoque');
      }


    } catch(e) {
      // TODO
      
      toast.error('Erro na alteração de quantidade do produto');
      // if (6) toast.error('Quantidade solicitada fora de estoque');

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
