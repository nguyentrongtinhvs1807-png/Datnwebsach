"use client";
import { useEffect, useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";

interface StudentType {
    id: number | string;
    studentId: string;
    fullName: string;
    dob: string;
    phone: string;
    email: string;
    address: string;
    className: string;
    subject: string;
    finalScore: number;
}

const StudentPage = () => {
    const [students, setStudents] = useState<StudentType[]>([]);
    const [student, setStudent] = useState<StudentType | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchStudents = async () => {
        const res = await fetch("http://localhost:3003/students");
        const data = await res.json();
        setStudents(data);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (id: number | string) => {
        try {
            await fetch(`http://localhost:3003/students/${id}`, {
                method: "DELETE"
            });
            toast.success("Xóa sinh viên thành công!");
            fetchStudents();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa!");
        }
    };
    
    const handleSave = async (e: any) => {
        e.preventDefault();
        const form = e.target;
        const newStudent = {
            studentId: form.studentId.value,
            fullName: form.fullName.value,
            dob: form.dob.value,
            phone: form.phone.value,
            email: form.email.value,
            address: form.address.value,
            className: form.className.value,
            subject: form.subject.value,
            finalScore: parseFloat(form.finalScore.value),
        };

        if (student) {
            await fetch(`http://localhost:3003/students/${student.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStudent)
            });
        } else {
            await fetch("http://localhost:3003/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStudent)
            });
        }

        setShowModal(false);
        setStudent(null);
        fetchStudents();
    };

    return (
        <div className="p-3">
            <h2>Danh sách sinh viên</h2>
            <Button onClick={() => { setStudent(null); setShowModal(true); }}>Thêm mới</Button>
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>MSSV</th>
                        <th>Họ tên</th>
                        <th>Lớp</th>
                        <th>Môn học</th>
                        <th>Điểm</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((sv) => (
                        <tr key={sv.id}>
                            <td>{sv.studentId}</td>
                            <td>{sv.fullName}</td>
                            <td>{sv.className}</td>
                            <td>{sv.subject}</td>
                            <td>{sv.finalScore}</td>
                            <td>
                                <Button variant="warning" size="sm" onClick={() => { setStudent(sv); setShowModal(true); }}>Sửa</Button>{' '}
                                <Button variant="danger" size="sm" onClick={() => handleDelete(sv.id)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton>
                        <Modal.Title>{student ? "Cập nhật" : "Thêm mới"} Sinh viên</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Mã số sinh viên</Form.Label>
                            <Form.Control name="studentId" defaultValue={student?.studentId} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Họ tên</Form.Label>
                            <Form.Control name="fullName" defaultValue={student?.fullName} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Ngày sinh</Form.Label>
                            <Form.Control type="date" name="dob" defaultValue={student?.dob} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Điện thoại</Form.Label>
                            <Form.Control name="phone" defaultValue={student?.phone} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control name="email" defaultValue={student?.email} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Địa chỉ</Form.Label>
                            <Form.Control name="address" defaultValue={student?.address} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Lớp học</Form.Label>
                            <Form.Control name="className" defaultValue={student?.className} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Môn học</Form.Label>
                            <Form.Control name="subject" defaultValue={student?.subject} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Điểm cuối khóa</Form.Label>
                            <Form.Control type="number" name="finalScore" defaultValue={student?.finalScore} required />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                        <Button type="submit" variant="primary">Lưu</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default StudentPage;
