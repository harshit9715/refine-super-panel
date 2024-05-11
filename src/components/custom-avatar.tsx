import { getNameInitials } from '@/utilities'
import { Avatar as AntdAvatar, AvatarProps } from 'antd'
import React from 'react'

type CustomAvatarProps = AvatarProps & {
    name: string
    style?: React.CSSProperties
}

const CustomAvatar = ({name, style, ...rest }: CustomAvatarProps) => {
  return (
    <AntdAvatar size="small" style={{backgroundColor: "#87d068", display: "flex", alignItems: "center", border: "none", ...style}} {...rest} alt={name}>{getNameInitials(name)}</AntdAvatar>
  )
}

export default CustomAvatar