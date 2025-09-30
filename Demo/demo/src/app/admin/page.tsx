"use client";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import AdminProduct from "@/components/admin.product";

const AdminPage = () => {
    return (
        <div>
        <div className="d-flex justify-content-center align-items-center my-4">
             <h1 className="fw-bold text-uppercase border-bottom pb-2">Quản lý sản phẩm</h1>
        </div>


            <AdminProduct />
        </div>
    );
};

export default AdminPage;
