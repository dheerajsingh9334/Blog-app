import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addCategoryAPI } from "../../APIServices/category/categoryAPI";
import AlertMessage from "../Alert/AlertMessage";

const AddCategory = () => {
  // category mutation
  const queryClient = useQueryClient();
  const categoryMutation = useMutation({
    mutationKey: ["create-category"],
    mutationFn: addCategoryAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-lists"] });
    }
  });
  const formik = useFormik({
    // initial data
    initialValues: {
      categoryName: "",
      description: "",
    },
    // validation
    validationSchema: Yup.object({
      categoryName: Yup.string().min(2, "Too short").max(40, "Too long").required("category name is required"),
      description: Yup.string().max(200, "Max 200 characters"),
    }),
    // submit
    onSubmit: (values, { resetForm }) => {
      categoryMutation.mutate(values, {
        onSuccess: () => resetForm(),
      });
    },
  });
  console.log(categoryMutation);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h1 className="text-3xl font-serif font-bold mb-6">Create a Category</h1>

          {categoryMutation.isPending && (
            <AlertMessage type="loading" message="Creating category..." />
          )}
          {categoryMutation.isSuccess && (
            <AlertMessage type="success" message="Category created successfully" />
          )}
          {categoryMutation.isError && (
            <AlertMessage type="error" message={categoryMutation?.error?.response?.data?.message} />
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category name</label>
              <input
                type="text"
                {...formik.getFieldProps("categoryName")}
                className="w-full rounded-lg p-3 outline-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Technology"
              />
              {formik.touched.categoryName && formik.errors.categoryName && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.categoryName}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description (optional)</label>
              <textarea
                rows={3}
                {...formik.getFieldProps("description")}
                className="w-full rounded-lg p-3 outline-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Short description of this category"
              />
              {formik.touched.description && formik.errors.description && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
              )}
            </div>

            <button
              className="w-full h-12 inline-flex items-center justify-center text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              type="submit"
              disabled={categoryMutation.isPending}
            >
              {categoryMutation.isPending ? 'Creating...' : 'Add Category'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
