import type { MouseEvent } from "react";
import { getTagColor } from "../utils/tagColors";

export interface TagMeta {
  label: string;
  count: number;
}

interface TagFilterProps {
  tags: TagMeta[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export const TagFilter = ({ tags, activeTag, onTagSelect }: TagFilterProps) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const { value } = event.currentTarget;
    if (value === "__ALL__") {
      onTagSelect(null);
      return;
    }
    onTagSelect(value);
  };

  return (
    <div className="tag-filter">
      <button
        type="button"
        value="__ALL__"
        className={`tag-pill ${activeTag === null ? "active" : ""}`.trim()}
        onClick={handleClick}
      >
        All
      </button>
      {tags.map((tag) => {
        const colors = getTagColor(tag.label);
        return (
          <button
            key={tag.label}
            type="button"
            value={tag.label}
            className={`tag-pill ${activeTag === tag.label ? "active" : ""}`.trim()}
            onClick={handleClick}
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
            }}
          >
            {tag.label}
            <span className="tag-count">{tag.count}</span>
          </button>
        );
      })}
    </div>
  );
};
