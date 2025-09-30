import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
interface iShow {
    showModalUpdate: boolean;
    setShowModalUpdate: (value: boolean) => void;
    post: PostType | null;
}

function UpdateModal({ showModalUpdate, setShowModalUpdate, post }: iShow) {
    const [title, setTitle] = useState<string>("");
    const [views, setViews] = useState<string>("");

    useEffect(() => {
        if (post && post.id) {
            setTitle(post.title);
            setViews(post.views);
        }
    }, [post]);
    const handleSubmit = () => {
        fetch(`http://localhost:3003/posts/${post?.id}`, {
            method: 'PUT',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({title, views})
          }).then(res => res.json())
            .then(res => {
                console.log(res)
            if(res){
                toast.success("Post Added Sucessfully...");
                handleClose();
            } else {
                toast.error("Something went wrong...")
            }
        });
    };
    const handleClose = () => {
        setTitle("");
        setViews("");
        setShowModalUpdate(false);
    };

    return (
        <Modal show={showModalUpdate} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Sửa bài viết</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Views</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Views"
                            value={views}
                            onChange={(e) => setViews(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Lưu
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UpdateModal;