import CustomAvatar from "./custom-avatar";
import { Text } from "./text";

type Props = {
  name?: string;
  avatar?: string;
  shape?: "circle" | "square";
};

const SelectOptionWithAvatar = ({ avatar, name, shape }: Props) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <CustomAvatar shape={shape} name={name || ""} src={avatar} />
      <Text>{name}</Text>
    </div>
  );
};

export default SelectOptionWithAvatar;
