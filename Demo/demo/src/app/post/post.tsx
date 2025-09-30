"use client";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import CreateModal from '@/components/creates.model';
import UpdateModal from "@/components/update.modal";
import Link from "next/link";

const Post = () => {
   
    const [posts, setPosts] = useState<PostType[]>([]);
    const [post, setPost] = useState<PostType|null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showModalUpdate, setShowModalUpdate] = useState<boolean>(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch("http://localhost:3003/posts");
                const data = await response.json();
                console.log("Dữ liệu lấy được:", data);

                setPosts(data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };
        fetchPosts();
    }, []);


    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3003/posts/${id}`, {
                method: "DELETE",
            });
    
            if (response.ok) {
                const updatedPosts = posts.filter((post) => post.id !== id);
                setPosts(updatedPosts);
                console.log(`Xóa bài viết ${id} thành công!`);
            } else {
                console.log("Xóa thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi xóa bài viết:", error);
        }
    };
    




    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between" }} className="mb-3">
                <h1>Post</h1>
                <Button onClick={() => setShowModal(true)}>Add</Button>
            </div>

            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>View</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.title}</td>
                            <td>{item.views}</td>
                            <td>
                            <button>
                                <Link href={`/post/${item.id}`}>View</Link>
                            </button>

                                <button className="mx-2" onClick={() => {
                                    setPost(item);
                                    setShowModalUpdate(true)}}
                                    >Edit
                                </button>  
                                <button onClick={() => handleDelete(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <CreateModal showModal={showModal} setShowModal={setShowModal} />
            <UpdateModal showModalUpdate={showModalUpdate}
             post={post}
             setShowModalUpdate={setShowModalUpdate} />
        </>
    );
};

export default Post;
