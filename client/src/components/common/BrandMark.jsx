import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const sizeClasses = {
  sm: {
    image: 'h-8 w-8',
    title: 'text-base',
    subtitle: 'text-[10px]',
  },
  md: {
    image: 'h-10 w-10',
    title: 'text-lg',
    subtitle: 'text-xs',
  },
  lg: {
    image: 'h-12 w-12',
    title: 'text-xl',
    subtitle: 'text-sm',
  },
}

function BrandMark({
  to = '/',
  size = 'md',
  variant = 'combo',
  subtitle,
  className = '',
  textClassName = '',
  subtitleClassName = '',
}) {
  const Wrapper = to ? Link : 'div'
  const classes = sizeClasses[size] || sizeClasses.md
  const showLogo = variant === 'logo' || variant === 'combo'
  const showText = variant === 'text' || variant === 'combo'

  return (
    <Wrapper
      to={to}
      className={`inline-flex items-center ${variant === 'combo' ? 'gap-3' : 'gap-0'} ${className}`.trim()}
      aria-label="Docvexa home"
    >
      {showLogo ? (
        <img src={logo} alt="Docvexa logo" className={`${classes.image} shrink-0 rounded-xl object-contain`} />
      ) : null}

      {showText ? (
        <span className={`flex min-w-0 flex-col leading-none ${showLogo ? 'ml-0' : ''} ${textClassName}`.trim()}>
          <span className={`font-extrabold tracking-tight text-primary ${classes.title}`.trim()}>Docvexa</span>
          {subtitle ? (
            <span
              className={`mt-1 font-medium uppercase tracking-[0.18em] text-slate-500 ${classes.subtitle} ${subtitleClassName}`.trim()}
            >
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </Wrapper>
  )
}

export default BrandMark