"use client";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import ProductModal from "../components/product.modal";

interface ProductType {
    id: number;
    name: string;
    price: string;
    image: string;
    description: string;
}

const AdminProduct = () => {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editProduct, setEditProduct] = useState<ProductType | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:3003/products");
            const data = await response.json();
            console.log("Data fetched:", data);
            setProducts(data);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
        }
    };
    

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    
        try {
            await fetch(`http://localhost:3003/products/${id}`, { method: "DELETE" });
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
        }
    };
    

    const handleEdit = (product: ProductType) => {
        setEditProduct(product);
        setShowModal(true);
    };

    return (
        <>
        <div className="text-center my-3">
  <Button 
    variant="primary" 
    className="px-4 py-2 fw-bold" 
    onClick={() => { setEditProduct(null); setShowModal(true); }}
  >
    + Thêm sản phẩm
  </Button>
</div>

<Table striped bordered hover responsive className="mt-3 text-center align-middle">
  <thead className="table-dark">
    <tr>
      <th>ID</th>
      <th>Tên sản phẩm</th>
      <th>Giá</th>
      <th>Hình ảnh</th>
      <th>Mô tả</th>
      <th>Hành động</th>
    </tr>
  </thead>
  <tbody>
    {products.map((product) => (
      <tr key={product.id}>
        <td className="fw-bold">{product.id}</td>
        <td>{product.name}</td>
        <td className="text-danger fw-bold">{product.price}VNĐ</td>
        <td className="text-center">
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60px" }}>
                <img 
                src={product.image} 
                alt={product.name} 
                className="rounded shadow-sm" 
                width="50" 
                height="50" 
                />
            </div>
        </td>

        <td className="text-truncate" style={{ maxWidth: "200px" }}>{product.description}</td>
        <td>
          <Button variant="warning" className="me-2" onClick={() => handleEdit(product)}>
            <i className="bi bi-pencil-square"></i> Sửa
          </Button>
          <Button variant="danger" onClick={() => handleDelete(product.id)}>
            <i className="bi bi-trash"></i> Xóa
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>

<ProductModal 
  showModal={showModal} 
  setShowModal={setShowModal} 
  fetchProducts={fetchProducts} 
  editProduct={editProduct} 
/>

        </>
    );
};

export default AdminProduct;
