import { Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import {
  CHECKLIST_COLORS,
  CHECKLIST_TRANSITIONS,
} from '../../constants/checklistStyles';

function createReactMarkdownParagraphElement({
  completed,
  props,
}: {
  completed: boolean;
  props: React.HtmlHTMLAttributes<HTMLElement>;
}) {
  return (
    <Typography
      component='p'
      sx={{
        py: '0.15rem',
        color: completed
          ? CHECKLIST_COLORS.primaryTextMuted
          : CHECKLIST_COLORS.text,
        transition: CHECKLIST_TRANSITIONS.color,
        fontSize: '0.85rem!important',
        fontWeight: '400!important',
      }}
      {...props}
    />
  );
}

function createReactMarkdownUlElement({
  completed,
  props,
}: {
  completed: boolean;
  props: React.HtmlHTMLAttributes<HTMLElement>;
}) {
  return (
    <Typography
      component='ul'
      sx={{
        py: '0.15rem',
        marginLeft: '1.25rem',
        listStyleType: 'disc',
        color: completed
          ? CHECKLIST_COLORS.primaryTextMuted
          : CHECKLIST_COLORS.text,
        transition: CHECKLIST_TRANSITIONS.color,
        fontSize: '0.85rem!important',
        fontWeight: '400!important',
      }}
      {...props}
    />
  );
}

function createReactMarkdownLiElement({
  completed,
  props,
}: {
  completed: boolean;
  props: React.HtmlHTMLAttributes<HTMLElement>;
}) {
  return (
    <Typography
      component='li'
      sx={{
        py: '0.15rem',
        listStyleType: 'disc',
        color: completed
          ? CHECKLIST_COLORS.primaryTextMuted
          : CHECKLIST_COLORS.text,
        transition: CHECKLIST_TRANSITIONS.color,
        fontSize: '0.85rem!important',
        fontWeight: '400!important',
      }}
      {...props}
    />
  );
}

function createReactMarkdownAElement({
  completed,
  props,
}: {
  completed: boolean;
  props: React.HtmlHTMLAttributes<HTMLAnchorElement>;
}) {
  return (
    <Typography
      component='a'
      target='_blank'
      sx={{
        color: completed
          ? CHECKLIST_COLORS.primaryTextMuted
          : CHECKLIST_COLORS.primary,
        textDecoration: 'underline',
        fontSize: '0.85rem!important',
        fontWeight: '400!important',
        '&:hover': {
          color: completed
            ? CHECKLIST_COLORS.primary
            : CHECKLIST_COLORS.primaryText,
          textDecoration: 'underline',
        },
        '&:active': {
          color: completed
            ? CHECKLIST_COLORS.primary
            : CHECKLIST_COLORS.primaryText,
          textDecoration: 'underline',
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      {...props}
    />
  );
}

const MarkdownContent = ({
  completed,
  content,
}: {
  completed: boolean;
  content: string;
}) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) =>
          createReactMarkdownParagraphElement({
            completed,
            props,
          }),
        h2: ({ node, ...props }) =>
          createReactMarkdownParagraphElement({
            completed,
            props,
          }),
        h3: ({ node, ...props }) =>
          createReactMarkdownParagraphElement({
            completed,
            props,
          }),
        h4: ({ node, ...props }) =>
          createReactMarkdownParagraphElement({
            completed,
            props,
          }),
        h5: ({ node, ...props }) =>
          createReactMarkdownParagraphElement({
            completed,
            props,
          }),
        h6: ({ node, ...props }) =>
          createReactMarkdownParagraphElement({
            completed,
            props,
          }),
        p: ({ node, ...props }) =>
          createReactMarkdownParagraphElement({
            completed,
            props,
          }),
        ul: ({ node, ...props }) =>
          createReactMarkdownUlElement({
            props,
            completed,
          }),
        li: ({ node, ...props }) =>
          createReactMarkdownLiElement({
            props,
            completed,
          }),
        a: ({ node, ...props }) =>
          createReactMarkdownAElement({
            completed,
            props,
          }),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

MarkdownContent.displayName = 'MarkdownContent';

export default MarkdownContent;
