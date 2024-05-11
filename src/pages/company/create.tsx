import SelectOptionWithAvatar from "@/components/select-option-with-avatar";
import { CREATE_COMPANY_MUTATION } from "@/graphql/mutations";
import { USERS_SELECT_QUERY } from "@/graphql/queries";
import { UsersSelectQuery } from "@/graphql/types";
import { useModalForm, useSelect } from "@refinedev/antd";
import { useGo } from "@refinedev/core";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import { Form, Input, Modal, Select } from "antd";
import { CompanyList } from "./list";

const CreateCompany = () => {
  const go = useGo();
  const { selectProps, queryResult } = useSelect<
    GetFieldsFromList<UsersSelectQuery>
  >({
    resource: "users",
    optionLabel: "name",
    meta: {
      gqlQuery: USERS_SELECT_QUERY,
    },
  });
  const goToListPage = () => {
    go({
      to: {
        resource: "companies",
        action: "list",
      },
      options: {
        keepQuery: true,
      },
      type: "replace",
    });
  };

  const { modalProps, formProps } = useModalForm({
    action: "create",
    defaultVisible: true,
    resource: "companies",
    redirect: false,
    mutationMode: "pessimistic",
    onMutationSuccess: () => {
      goToListPage();
    },
    meta: {
      gqlMutation: CREATE_COMPANY_MUTATION,
    },
  });
  return (
    <CompanyList>
      <Modal
        {...modalProps}
        mask={true}
        onCancel={goToListPage}
        title="Create Company"
        width={512}
      >
        <Form {...formProps} layout="vertical">
          <Form.Item
            label="Company Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter company name",
              },
            ]}
          >
            <Input placeholder="Company Name" />
          </Form.Item>
          <Form.Item
            label="Sales Owner"
            name="salesOwnerId"
            rules={[
              {
                required: true,
                message: "Please enter sales owner",
              },
            ]}
          >
            <Select
              placeholder="Select Sales Owner"
              {...selectProps}
              options={
                queryResult.data?.data.map((user) => ({
                  value: user.id,
                  label: (
                    <SelectOptionWithAvatar
                      name={user.name}
                      avatar={user.avatarUrl || undefined}
                    />
                  ),
                })) ?? []
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </CompanyList>
  );
};

export default CreateCompany;
