import React from 'react';
import classNames from 'classnames';
import ThemedScrollbars from '../themed-scrollbars/themed-scrollbars';
import Tab from './tab';
import './tabs.scss';

declare module 'react' {
    interface HTMLAttributes<T> extends React.AriaAttributes, React.DOMAttributes<T> {
        label?: React.ReactNode;
        hash?: string;
    }
}

type TTabsProps = {
    active_icon_color?: string;
    active_index?: number;
    background_color?: string;
    bottom?: boolean;
    center?: boolean;
    children: (React.ReactElement | null)[];
    className?: string;
    fit_content?: boolean;
    has_active_line?: boolean;
    has_bottom_line?: boolean;
    header_fit_content?: boolean;
    history?: History;
    icon_color?: string;
    icon_size?: number;
    is_100vw?: boolean;
    is_full_width?: boolean;
    is_overflow_hidden?: boolean;
    is_scrollable?: boolean;
    onTabItemClick?: (active_tab_index: number) => void;
    should_update_hash?: boolean;
    single_tab_has_no_label?: boolean;
    top: boolean;
};

const Tabs = ({
    active_icon_color = '',
    active_index,
    background_color = '',
    bottom = false,
    center = false,
    children,
    className = '',
    fit_content = false,
    has_active_line = true,
    has_bottom_line = true,
    header_fit_content = false,
    history,
    icon_color = '',
    icon_size = 0,
    is_100vw = false,
    is_full_width = false,
    is_overflow_hidden = false,
    is_scrollable = false,
    onTabItemClick,
    should_update_hash = false,
    single_tab_has_no_label = false,
    top,
}: TTabsProps) => {
    const [active_line_style, setActiveLineStyleState] = React.useState<React.CSSProperties>({});
    const setActiveLineStyle = () => {
        const activeEl = active_tab_ref.current;
        const wrapper = tabs_wrapper_ref.current;
        if (!activeEl || !wrapper) {
            setActiveLineStyleState({});
            return;
        }
        const activeRect = activeEl.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const left = activeRect.left - wrapperRect.left + wrapper.scrollLeft;
        const width = activeRect.width;
        setActiveLineStyleState({ left: `${left}px`, width: `${width}px` } as React.CSSProperties);
    };
    const active_tab_ref = React.useRef<HTMLLIElement>(null);
    const tabs_wrapper_ref = React.useRef<HTMLUListElement>(null);
    const pushHash = (hash: string) => {
        if (!history) return;
        history.replace(`${history.location.pathname}${window.location.search}#${hash}`);
    };

    const valid_children = React.Children.toArray(children).filter(child =>
        React.isValidElement(child)
    ) as React.ReactElement[];
    let tab_width: string;

    const getInitialActiveIndex = () => {
        let initial_index_to_show = typeof active_index === 'number' ? active_index : 0;
        if (should_update_hash && history) {
            const hash = location.hash.slice(1);
            const hash_index = valid_children.findIndex(child => child && child.props && child.props.hash === hash);
            const has_hash = hash_index > -1;

            if (has_hash) {
                initial_index_to_show = hash_index;
            } else {
                const child_props = valid_children[initial_index_to_show]?.props;
                const current_id = child_props && child_props.hash;
                if (current_id) {
                    pushHash(current_id);
                }
            }
        }
        return initial_index_to_show;
    };

    const [internal_active_tab_index, setInternalActiveTabIndex] = React.useState(getInitialActiveIndex);
    const active_tab_index = typeof active_index === 'number' ? active_index : internal_active_tab_index;
    const active_child = valid_children[active_tab_index] ?? null;

    React.useEffect(() => {
        if (typeof active_index === 'number' && active_index !== internal_active_tab_index) {
            setInternalActiveTabIndex(active_index);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_index]);

    React.useEffect(() => {
        setActiveLineStyle();
    }, [active_tab_index, setActiveLineStyle]);

    const onClickTabItem = (index: number) => {
        if (active_index === undefined) {
            setInternalActiveTabIndex(index);
        }
        if (should_update_hash) {
            const hash = valid_children[index]?.props['data-hash'];
            pushHash(hash);
        }
        onTabItemClick?.(index);
        setActiveLineStyle();
    };

    if (is_scrollable) {
        tab_width = 'unset';
    } else {
        tab_width = fit_content ? '150px' : `${(100 / Math.max(valid_children.length, 1)).toFixed(2)}%`;
    }

    return (
        <div
            className={classNames('dc-tabs', {
                [`dc-tabs--${className}`]: className,
                'dc-tabs--top': top,
                'dc-tabs--100vw': is_100vw,
            })}
            style={{ '--tab-width': `${tab_width}`, background: background_color } as React.CSSProperties}
        >
            <div className={classNames({ [`dc-tabs__list--header--${className}`]: className })}>
                <ul
                    className={classNames('dc-tabs__list', {
                        'dc-tabs__list--top': top,
                        'dc-tabs__list--border-bottom': has_bottom_line,
                        'dc-tabs__list--bottom': bottom,
                        'dc-tabs__list--center': center,
                        'dc-tabs__list--header-fit-content': header_fit_content,
                        'dc-tabs__list--full-width': is_full_width,
                        [`dc-tabs__list--${className}`]: className,
                        'dc-tabs__list--overflow-hidden': is_overflow_hidden,
                    })}
                    ref={tabs_wrapper_ref}
                >
                    <ThemedScrollbars
                        className='dc-themed-scrollbars-wrapper'
                        is_only_horizontal
                        is_scrollbar_hidden
                        is_bypassed={!is_scrollable}
                    >
                        {valid_children.map((child, index) => {
                            const { icon, label, id } = child.props;
                            const header_content = child.props['data-header-content'];
                            const count = child.props['data-count'];
                            return (
                                <Tab
                                    active_icon_color={active_icon_color}
                                    className={className}
                                    count={count}
                                    icon={icon}
                                    icon_color={icon_color}
                                    icon_size={icon_size}
                                    is_active={index === active_tab_index}
                                    key={label || id || index}
                                    is_label_hidden={valid_children.length === 1 && single_tab_has_no_label}
                                    label={label}
                                    id={id}
                                    is_scrollable={is_scrollable}
                                    top={top}
                                    bottom={bottom}
                                    header_fit_content={header_fit_content}
                                    active_tab_ref={index === active_tab_index ? active_tab_ref : null}
                                    header_content={header_content}
                                    onClick={() => onClickTabItem(index)}
                                    setActiveLineStyle={setActiveLineStyle}
                                />
                            );
                        })}
                        {has_active_line && !is_scrollable && (
                            <span
                                className={classNames('dc-tabs__active-line', {
                                    'dc-tabs__active-line--top': top,
                                    'dc-tabs__active-line--bottom': bottom,
                                    'dc-tabs__active-line--fit-content': fit_content,
                                    'dc-tabs__active-line--header-fit-content': header_fit_content,
                                    'dc-tabs__active-line--is-hidden': children.length === 1 && single_tab_has_no_label,
                                })}
                                style={active_line_style}
                            />
                        )}
                    </ThemedScrollbars>
                </ul>
            </div>
            <div
                className={classNames('dc-tabs__content', {
                    [`dc-tabs__content--${className}`]: className,
                })}
            >
                {active_child ? (
                    <div key={active_tab_index} className='dc-tabs__panel'>
                        {active_child.props.children}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Tabs;
