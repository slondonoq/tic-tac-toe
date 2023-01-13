// Buttons are considered to either contain
// text or an icon, cannot contain both
const Button = ({
    text,
    onClick,
    type,
    icon,
    aria_label,
    additionalClasses

}) => (
    <button
    className={type ? `button button--${type} ${icon ? 'button--icon' : ''} ${additionalClasses || ''}` : 'button' }
    onClick={onClick}
    aria-label={aria_label}>
        {
            icon
            ? <img src={icon} alt="" />
            : text || 'Dummy tex'
        }
    </button>
);

export default Button;