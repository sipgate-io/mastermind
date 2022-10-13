import { ReactNode } from "react";
import logo from "./sipagte_black.png"
import "./TextLayout.css"

export const TextLayout = (props: {
    children: ReactNode,
    title: string
}) => {
    return <div className="text-layout">
        <img className="text-layout" src={logo} />
        <h1>{props.title}</h1>
        {props.children}
    </div>;
}

export const TextLayoutAction = (props: {
    children: ReactNode
}) => {
    return <div className="text-layout__call-to-action">
        {props.children}
    </div>
}

export const TextLayoutActionSpan = (props: {
    children: ReactNode
}) => {
    return <span className="text-layout__call-number">{props.children}</span>;
}
