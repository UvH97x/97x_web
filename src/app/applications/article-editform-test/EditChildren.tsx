// EditChildren.tsx



import { Section } from "./article-edit-type"

interface EditChildrenProps {
  children: Section[];
  onSectionChange: (updateChildren: Section[]) => void;
}

const EditChildren: React.FC<EditChildrenProps> = ({ children, onSectionChange }) => {
  // 状態管理

  return (
    <div>
      本　編：
    </div>
  )
}

export default EditChildren;