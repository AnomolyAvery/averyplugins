import React from 'react'

type Props = {
    children: React.ReactNode;
}

const AppLayout: React.FC<Props> = ({
    children
}) => {
    return (
        <>
            <AppNav />
            <main>
                {children}
            </main>
        </>
    )
}


type AppNavProps = {

}


const AppNav: React.FC<AppNavProps> = ({ }) => {
    return (
        <nav className='bg-neutral-900/50 py-6 shadow border-b border-neutral-700'>

        </nav>
    )
};

export default AppLayout