import MuiIconButton, { type IconButtonProps } from "@mui/material/IconButton";

type Props = Pick<
  IconButtonProps,
  | "className"
  | "disabled"
  | "onClick"
  | "size"
  | "color"
  | "aria-label"
  | "children"
  | "edge"
>;

export default function IconButton(props: Props) {
  return <MuiIconButton {...props} />;
}
