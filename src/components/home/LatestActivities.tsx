import {
  DASHBOARD_LATEST_ACTIVITIES_AUDITS_QUERY,
  DASHBOARD_LATEST_ACTIVITIES_DEALS_QUERY,
} from "@/graphql/queries";
import {
  DashboardLatestActivitiesAuditsQuery,
  DashboardLatestActivitiesDealsQuery,
} from "@/graphql/types";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import { Card, List, Space } from "antd";
import dayjs from "dayjs";
import CustomAvatar from "../custom-avatar";
import LatestActivitiesSkeleton from "../skeleton/latest-activities";
import { Text } from "../text";

const LatestActivities = () => {
  const {
    data: audit,
    isLoading: isLoadingAudit,
    isError,
    error,
  } = useList<GetFieldsFromList<DashboardLatestActivitiesAuditsQuery>>({
    resource: "audits",
    meta: {
      gqlQuery: DASHBOARD_LATEST_ACTIVITIES_AUDITS_QUERY,
      variables: {},
    },
  });

  const dealIds = audit?.data.map((audit) => audit.targetId);
  const { data: deals, isLoading: isLoadingDeals } = useList<
    GetFieldsFromList<DashboardLatestActivitiesDealsQuery>
  >({
    resource: "deals",
    queryOptions: { enabled: !!dealIds?.length },
    pagination: { mode: "off" },
    filters: [{ field: "id", operator: "in", value: dealIds || [] }],
    meta: {
      gqlQuery: DASHBOARD_LATEST_ACTIVITIES_DEALS_QUERY,
    },
  });
  if (isError) {
    console.error(error);
    return null;
  }
  const isLoading = isLoadingAudit || isLoadingDeals;

  return (
    <Card
      headStyle={{ padding: "16px" }}
      bodyStyle={{ padding: "0 1rem" }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UnorderedListOutlined />
          <Text size="sm" style={{ marginLeft: "0.5rem" }}>
            Latest Activities
          </Text>
        </div>
      }
    >
      {isLoading ? (
        <List
          itemLayout="horizontal"
          dataSource={Array.from({ length: 5 }, (_, i) => i)}
          renderItem={(_, index) => <LatestActivitiesSkeleton key={index} />}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={audit?.data}
          renderItem={(item) => {
            const deal = deals?.data.find(
              (deal) => deal.id === `${item.targetId}` || undefined
            );
            return (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Text size="md">
                      {dayjs(deal?.createdAt).format("MMM DD, YYYY - HH:mm")}
                    </Text>
                  }
                  avatar={
                    <CustomAvatar
                      shape="square"
                      size={48}
                      src={deal?.company.avatarUrl}
                      name={deal?.company.name || ""}
                      style={{}}
                    />
                  }
                  description={
                    <Space size={4}>
                      <Text strong>{item.user?.name}</Text>
                      <Text>
                        {item.action === "CREATE" ? "created" : "moved"} a deal
                      </Text>
                      <Text strong>{deal?.title}</Text>
                      <Text>{"deal"}</Text>
                      <Text>{item.action === "CREATE" ? "in" : "to"}</Text>
                      <Text strong>{deal?.stage?.title}</Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

export default LatestActivities;
