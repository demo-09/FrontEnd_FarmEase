import { Routes } from '@angular/router';

// Components
import { Signup } from './pages/signup/signup';
import { Login } from './pages/login/login';
import { HomePage } from './pages/Home/home-page/home-page';
import { About } from './pages/about/about';
import { News } from './pages/news/news';
import { Products } from './pages/products/products';
import { Profile } from './pages/profile/profile';
import { Cart } from './pages/cart/cart';
import { OrdersComponent } from './pages/orders/orders';
import { WishlistComponent } from './pages/wishlist/wishlist';
import { DataComponent } from './pages/data-cs/data-cs';
import { Contact } from './pages/contact/contact';
import { AddProduct } from './pages/add-product/add-product';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Chat } from './pages/chat/chat';
import { Admin } from './pages/admin/admin';
import { AichatComponent } from './pages/aichat.component/aichat.component';
import { OrderDetail } from './pages/order-detail/order-detail';
// Guard
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public
  { path: 'home', component: HomePage },
  { path: 'signup', component: Signup },
  { path: 'Signup', redirectTo: 'signup' },
  { path: 'login', component: Login },
  { path: 'Login', redirectTo: 'login' },
  { path: 'about', component: About },
  { path: 'ai', component: AichatComponent },



  // Shared (Protected)
  {
    path: 'news',
    component: News,
    canActivate: [authGuard],
    data: { roles: ['admin', 'farmer', 'customer'] }
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },
  {
    path: 'contact',
    component: Contact,
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    component: Chat,
    canActivate: [authGuard]
  },

  // Product Flow
  {
    path: 'products',
    component: Products,
    canActivate: [authGuard],
    data: { roles: ['admin', 'farmer', 'customer'] }
  },
  {
    path: 'product-detail/:type/:id',
    component: ProductDetail,
    canActivate: [authGuard]
  },

  // Cart / Orders
  {
    path: 'cart',
    component: Cart,
    canActivate: [authGuard],
    data: { roles: ['farmer', 'customer'] }
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [authGuard],
    data: { roles: ['farmer', 'customer'] }
  },
  {
    path: 'order-detail',
    component: OrderDetail,
    canActivate: [authGuard]
  },
  {
    path: 'wishlist',
    component: WishlistComponent,
    canActivate: [authGuard],
    data: { roles: ['farmer', 'customer'] }
  },

  // Farmer
  {
    path: 'add-product',
    component: AddProduct,
    canActivate: [authGuard],
    data: { roles: ['farmer', 'admin'] }
  },

  // Admin
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'data',
    component: DataComponent,
    canActivate: [authGuard],
    data: { roles: ['admin', 'farmer'] }
  },

  // Fallback
  { path: '**', redirectTo: 'home' }
];
