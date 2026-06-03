import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api, API_BASE_URL } from './api';
import './style.css';

function App() {
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [message, setMessage] = useState('');

  const loadAll = async () => {
    const [p, c, o, d] = await Promise.all([
      api.get('/products'), api.get('/customers'), api.get('/orders'), api.get('/dashboard')
    ]);
    setProducts(p.data); setCustomers(c.data); setOrders(o.data); setDashboard(d.data);
  };

  useEffect(() => { loadAll().catch(showError); }, []);
  const showError = (err) => setMessage(err.response?.data?.detail || err.message || 'Something went wrong');
  const success = (msg) => { setMessage(msg); loadAll().catch(showError); };

  return <div>
    <header><h1>Inventory & Order Management</h1><p>Backend: {API_BASE_URL}</p></header>
    <nav>{['dashboard','products','customers','orders'].map(t => <button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</nav>
    {message && <div className="message" onClick={()=>setMessage('')}>{message}</div>}
    <main>
      {tab==='dashboard' && <Dashboard data={dashboard} products={products}/>} 
      {tab==='products' && <Products products={products} success={success} showError={showError}/>} 
      {tab==='customers' && <Customers customers={customers} success={success} showError={showError}/>} 
      {tab==='orders' && <Orders orders={orders} products={products} customers={customers} success={success} showError={showError}/>} 
    </main>
  </div>;
}

function Dashboard({data, products}) {
  return <section><div className="cards">
    <Card title="Products" value={data.total_products || 0}/><Card title="Customers" value={data.total_customers || 0}/>
    <Card title="Orders" value={data.total_orders || 0}/><Card title="Low Stock" value={data.low_stock_products || 0}/>
  </div><h2>Low Stock Products</h2><Table headers={['Name','SKU','Stock']} rows={products.filter(p=>p.quantity_in_stock<=5).map(p=>[p.name,p.sku,p.quantity_in_stock])}/></section>;
}
function Card({title,value}) { return <div className="card"><h3>{title}</h3><strong>{value}</strong></div>; }

function Products({products, success, showError}) {
  const [form, setForm] = useState({name:'', sku:'', price:'', quantity_in_stock:''});
  const [editId, setEditId] = useState(null);
  const save = async e => { e.preventDefault(); try {
    const payload = {...form, price:Number(form.price), quantity_in_stock:Number(form.quantity_in_stock)};
    editId ? await api.put(`/products/${editId}`, payload) : await api.post('/products', payload);
    setForm({name:'', sku:'', price:'', quantity_in_stock:''}); setEditId(null); success(editId?'Product updated':'Product added');
  } catch(err){ showError(err); }};
  const del = async id => { if(confirm('Delete product?')) { try{ await api.delete(`/products/${id}`); success('Product deleted'); } catch(err){ showError(err); } } };
  return <section><h2>Products</h2><form onSubmit={save} className="form grid">
    <input required placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
    <input required placeholder="SKU" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/>
    <input required type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
    <input required type="number" min="0" placeholder="Stock" value={form.quantity_in_stock} onChange={e=>setForm({...form,quantity_in_stock:e.target.value})}/>
    <button>{editId?'Update':'Add'} Product</button>
  </form><div className="list">{products.map(p=><div className="row" key={p.id}><span><b>{p.name}</b> | {p.sku} | ₹{p.price} | Stock {p.quantity_in_stock}</span><div><button onClick={()=>{setEditId(p.id);setForm(p)}}>Edit</button><button className="danger" onClick={()=>del(p.id)}>Delete</button></div></div>)}</div></section>;
}

function Customers({customers, success, showError}) {
  const [form, setForm] = useState({full_name:'', email:'', phone:''});
  const save = async e => { e.preventDefault(); try { await api.post('/customers', form); setForm({full_name:'',email:'',phone:''}); success('Customer added'); } catch(err){ showError(err); } };
  const del = async id => { if(confirm('Delete customer?')) { try{ await api.delete(`/customers/${id}`); success('Customer deleted'); } catch(err){ showError(err); } } };
  return <section><h2>Customers</h2><form onSubmit={save} className="form grid"><input required placeholder="Full name" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/><input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input required placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><button>Add Customer</button></form><div className="list">{customers.map(c=><div className="row" key={c.id}><span><b>{c.full_name}</b> | {c.email} | {c.phone}</span><button className="danger" onClick={()=>del(c.id)}>Delete</button></div>)}</div></section>;
}

function Orders({orders, products, customers, success, showError}) {
  const [form, setForm] = useState({customer_id:'', product_id:'', quantity:1});
  const save = async e => { e.preventDefault(); try { await api.post('/orders', {customer_id:Number(form.customer_id), items:[{product_id:Number(form.product_id), quantity:Number(form.quantity)}]}); success('Order created and stock reduced'); } catch(err){ showError(err); } };
  const del = async id => { if(confirm('Delete order?')) { try{ await api.delete(`/orders/${id}`); success('Order deleted'); } catch(err){ showError(err); } } };
  return <section><h2>Orders</h2><form onSubmit={save} className="form grid"><select required value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})}><option value="">Select customer</option>{customers.map(c=><option value={c.id} key={c.id}>{c.full_name}</option>)}</select><select required value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})}><option value="">Select product</option>{products.map(p=><option value={p.id} key={p.id}>{p.name} - Stock {p.quantity_in_stock}</option>)}</select><input required type="number" min="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/><button>Create Order</button></form><div className="list">{orders.map(o=><div className="order" key={o.id}><div className="row"><span><b>Order #{o.id}</b> | {o.customer_name} | ₹{o.total_amount}</span><button className="danger" onClick={()=>del(o.id)}>Delete</button></div><ul>{o.items.map(i=><li key={i.id}>{i.product_name} ({i.sku}) × {i.quantity} = ₹{i.line_total}</li>)}</ul></div>)}</div></section>;
}

function Table({headers, rows}) { return <table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table>; }

createRoot(document.getElementById('root')).render(<App/>);
