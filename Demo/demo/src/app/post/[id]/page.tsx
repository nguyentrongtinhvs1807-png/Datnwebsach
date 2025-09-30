"use client";

import Link from "next/link";
import useSWR, { Fetcher } from 'swr'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
const PostDetail = ({params}: {params: { id: string } }) => {

    const fetcher: Fetcher<PostType, string> = (url:string) => fetch(url).then(res => res.json())
    const {data , error , isLoading} = useSWR(
        `http://localhost:3003/posts/${params.id}`,
        fetcher,
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    return (
        <>
          <Card className="text-center">
            <Card.Header>Bạn đang xem bài viết số {params.id}</Card.Header>
            <Card.Body>
              <Card.Title>{data?.title}</Card.Title>
              <Card.Text>{data?.views}</Card.Text>
              <Button variant="warning">
                <Link href="/">Trở về Home</Link>
              </Button>
            </Card.Body>
            <Card.Footer className="text-muted">2 days ago</Card.Footer>
          </Card>
        </>
      );      
  };

export default PostDetail;