import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import SubscriptIcon from '@mui/icons-material/Subscript';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import './RichTextEditor.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RichTextEditorProps {
  /** Initial HTML content. Only read on mount; changes are emitted via onChange. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: boolean;
  errorText?: string;
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

interface ToolbarBtnProps {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const ToolbarBtn: React.FC<ToolbarBtnProps> = ({ title, active, onClick, children }) => (
  <Tooltip title={title} placement="top">
    <span>
      <IconButton
        size="small"
        // onMouseDown prevents the editor losing focus when clicking toolbar
        onMouseDown={(e) => {
          e.preventDefault();
          onClick();
        }}
        sx={{
          borderRadius: 1,
          width: 28,
          height: 28,
          bgcolor: active ? 'action.selected' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {children}
      </IconButton>
    </span>
  </Tooltip>
);

// ─── Main component ───────────────────────────────────────────────────────────

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  error,
  errorText,
}) => {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable features that add noise for flashcard use
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Subscript,
      Superscript,
      Placeholder.configure({
        placeholder: placeholder ?? 'Enter text…',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => () => { editor?.destroy(); }, [editor]);

  if (!editor) return null;

  return (
    <Box sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <Box
        sx={{
          border: '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          '&:focus-within': {
            borderColor: error ? 'error.main' : 'primary.main',
          },
        }}
      >
        {/* ── Toolbar ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            px: 0.75,
            py: 0.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexWrap: 'wrap',
            bgcolor: 'action.hover',
          }}
        >
          <ToolbarBtn
            title={t('richText.bold')}
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FormatBoldIcon sx={{ fontSize: 18 }} />
          </ToolbarBtn>

          <ToolbarBtn
            title={t('richText.italic')}
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FormatItalicIcon sx={{ fontSize: 18 }} />
          </ToolbarBtn>

          <ToolbarBtn
            title={t('richText.underline')}
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <FormatUnderlinedIcon sx={{ fontSize: 18 }} />
          </ToolbarBtn>

          <ToolbarBtn
            title={t('richText.strikethrough')}
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughSIcon sx={{ fontSize: 18 }} />
          </ToolbarBtn>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.25 }} />

          <ToolbarBtn
            title={t('richText.bulletList')}
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FormatListBulletedIcon sx={{ fontSize: 18 }} />
          </ToolbarBtn>

          <ToolbarBtn
            title={t('richText.numberedList')}
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <FormatListNumberedIcon sx={{ fontSize: 18 }} />
          </ToolbarBtn>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.25 }} />

          <ToolbarBtn
            title={t('richText.subscript')}
            active={editor.isActive('subscript')}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
          >
            <SubscriptIcon sx={{ fontSize: 18 }} />
          </ToolbarBtn>

          <ToolbarBtn
            title={t('richText.superscript')}
            active={editor.isActive('superscript')}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
          >
            <SuperscriptIcon sx={{ fontSize: 18 }} />
          </ToolbarBtn>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.25 }} />

          <ToolbarBtn
            title={t('richText.clearFormatting')}
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          >
            <FormatClearIcon sx={{ fontSize: 18 }} />
          </ToolbarBtn>
        </Box>

        {/* ── Editor area ── */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            minHeight: 90,
            maxHeight: 180,
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {errorText && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', px: 1.75 }}>
          {errorText}
        </Typography>
      )}
    </Box>
  );
};

export default RichTextEditor;
