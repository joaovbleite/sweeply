# Sweeply - UI/UX Guidelines

## Brand Identity

### Colors
- **Primary**: #3B82F6 (Blue)
- **Secondary**: #EF4444 (Red)
- **Accent**: #10B981 (Green)
- **Neutrals**:
  - Dark: #111827
  - Gray: #6B7280
  - Light: #F3F4F6
  - White: #FFFFFF

### Typography
- **Primary Font**: Inter
- **Heading Font**: Poppins
- **Font Sizes**:
  - Heading 1: 32px (2rem)
  - Heading 2: 24px (1.5rem)
  - Heading 3: 20px (1.25rem)
  - Heading 4: 18px (1.125rem)
  - Body: 16px (1rem)
  - Small: 14px (0.875rem)
  - Tiny: 12px (0.75rem)

### Icons
- Use Lucide React icons library
- Maintain consistent size and style
- Default icon size: 20px for UI elements

## Components

### Buttons
- **Primary**: Blue background, white text
- **Secondary**: White background, blue border, blue text
- **Danger**: Red background, white text
- **Success**: Green background, white text
- **Button sizes**:
  - Small: px-3 py-1.5, text-sm
  - Medium: px-4 py-2, text-base
  - Large: px-5 py-2.5, text-lg

### Cards
- White background
- Border radius: 12px (0.75rem)
- Shadow: shadow-sm
- Padding: 16px (1rem)
- Border: 1px solid #E5E7EB (optional)

### Form Elements
- Input height: 40px
- Border radius: 6px (0.375rem)
- Border color: #D1D5DB
- Focus state: Blue ring, blue border
- Error state: Red border, red error message
- Label: Text-sm, font-medium, text-gray-700

### Tables
- Header: Light gray background, dark text
- Row dividers: Light gray border
- Hover state: Very light blue background
- Action buttons: Small size, icon buttons preferred
- Padding: px-4 py-3

## Layout

### Spacing
- Base unit: 4px (0.25rem)
- Common spacing:
  - Extra small: 4px (0.25rem)
  - Small: 8px (0.5rem)
  - Medium: 16px (1rem)
  - Large: 24px (1.5rem)
  - Extra large: 32px (2rem)
  - Huge: 64px (4rem)

### Containers
- Max width: 1280px
- Padding: 16px (1rem) on small screens, 24px (1.5rem) on larger screens
- Margin: Auto for center alignment

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+

## Patterns

### Loading States
- Use skeleton loaders for content
- Use spinner for actions
- Avoid freezing the UI during loading

### Empty States
- Provide clear illustrations
- Include helpful action buttons
- Use supportive, encouraging text

### Error Handling
- Show clear error messages
- Provide recovery actions when possible
- Use red sparingly to highlight errors

### Navigation
- Mobile: Bottom navigation bar
- Desktop: Sidebar navigation
- Keep critical actions easily accessible

## Accessibility

### Contrast
- Maintain WCAG AA compliance at minimum
- Text on colored backgrounds must have sufficient contrast

### Focus States
- All interactive elements must have visible focus states
- Use blue focus ring (ring-2 ring-blue-500)

### Screen Readers
- All images must have alt text
- Use semantic HTML elements
- Ensure proper ARIA attributes where needed

## Animation

### Transitions
- Duration: 150-300ms
- Timing function: Ease-in-out
- Use for: Hover states, expanding/collapsing elements

### Feedback Animations
- Subtle scale changes for clicks
- Progress indicators for longer operations
- Toast notifications for confirmations 