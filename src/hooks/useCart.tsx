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

        const isProductInCart:boolean = parsedCart.filter(p => p.id === productId).length >0;


        if(newProduct ){//&& !isProductInCart){

          const updatedCart = [...cart, newProduct.data ]
          
          setCart(updatedCart as Product[]);
          localStorage.setItem('@RocketShoes:cart' , JSON.stringify(updatedCart));
        }
        
      } catch {
        // TODO
      }
    };
    
    const removeProduct = (productId: number) => {
      try {
        // TODO
        const updatedCart = cart.filter(product => product.id !== productId);
        localStorage.setItem('@RocketShoes:cart' , JSON.stringify(updatedCart));
        setCart(updatedCart as Product[]);
        console.log(updatedCart);

    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      // await api.put(`stock/${productId}`,{amount: amount});

      localStorage.setItem('@RocketShoes:cart' , JSON.stringify(cart));
        setCart(cart);

    } catch {
      // TODO

      toast.error('Quantidade solicitada fora de estoque');
      toast.error('Erro na alteração de quantidade do produto');

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
