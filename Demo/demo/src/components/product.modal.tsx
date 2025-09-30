"use client";
import { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";

interface ProductType {
    id?: number;
    name: string;
    price: string;
    image: string;
    description: string;
}

interface ModalProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    fetchProducts: () => void;
    editProduct: ProductType | null;
}

const ProductModal = ({ showModal, setShowModal, fetchProducts, editProduct }: ModalProps) => {
    const [name, setName] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [image, setImage] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    useEffect(() => {
        if (editProduct) {
            setName(editProduct.name);
            setPrice(editProduct.price);
            setImage(editProduct.image);
            setDescription(editProduct.description);
        } else {
            setName("");
            setPrice("");
            setImage("");
            setDescription("");
        }
    }, [editProduct]);

    const handleSubmit = async () => {
        const productData = { name, price, image, description };
    
        try {
            if (editProduct) {
                await fetch(`http://localhost:3003/products/${editProduct.id}`, {  
                    method: "PUT",
                    body: JSON.stringify(productData),
                    headers: { "Content-Type": "application/json" },
                });
                toast.success("Cập nhật sản phẩm thành công!");
            } else {
                await fetch("http://localhost:3003/products", {  
                    method: "POST",
                    body: JSON.stringify(productData),
                    headers: { "Content-Type": "application/json" },
                });
                toast.success("Thêm sản phẩm thành công!");
            }

            fetchProducts();
            setShowModal(false);
        } catch (error) {
            toast.error("Lỗi khi thêm/cập nhật sản phẩm!");
        }
    };
    

    return (
        <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>{editProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên sản phẩm</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên sản phẩm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Giá</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập giá sản phẩm"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Hình ảnh</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="URL hình ảnh"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Nhập mô tả sản phẩm"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    {editProduct ? "Cập nhật" : "Thêm"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProductModal;
