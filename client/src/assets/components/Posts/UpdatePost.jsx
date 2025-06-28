import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchPost,UpdatePostAPI } from "../../components/APIService/postsAPI";
import { useFormik } from "formik";
import * as Yup from "yup";

const UpdatePost = () => {
  const { postId } = useParams();

  const {
    data,
    isLoading: queryLoading,
    isError: queryError,
    error: queryErrorMessage,
  } = useQuery({
    queryKey: ['post-details', postId],
    queryFn: () => fetchPost(postId),
  });

  const postMutation = useMutation({
    mutationKey: ['update-post'],
    mutationFn: UpdatePostAPI,
  });

  const formik = useFormik({
    enableReinitialize: true, // Allow reset when data is loaded
    initialValues: {
      title: data?.postFound.title || '',
      description: data?.postFound.description || '',
    },
   
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
    }),
  onSubmit: (value) => {
            const postData = {
                title: value.title,
                description: value.description,
                postId
            };
              console.log("Sending postData:", postData); 
            postMutation.mutate(postData);
        }
  });

  if (queryLoading) return <p>Loading post...</p>;
  if (queryError) return <p>Error: {queryErrorMessage.message}</p>;
console.log(data)
  return (
    <div>
      <h1>You are editing the title: {data.postFound.title}</h1>

      <div>
        {postMutation.isPending && <p>Updating...</p>}
        {postMutation.isSuccess && <p>Post updated successfully</p>}
        {postMutation.isError && <p>Error: {postMutation.error.message}</p>}

        <form onSubmit={formik.handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Enter Title"
            {...formik.getFieldProps('title')}
          />
          {formik.touched.title && formik.errors.title && (
            <span style={{ color: "red" }}>{formik.errors.title}</span>
          )}
          <br />
          <input
            type="text"
            name="description"
            placeholder="About Post..."
            {...formik.getFieldProps('description')}
          />
          {formik.touched.description && formik.errors.description && (
            <span style={{ color: "red" }}>{formik.errors.description}</span>
          )}
          <br />
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePost;
