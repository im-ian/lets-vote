interface ContainerProps {
	children: React.ReactNode;
}

function Container({ children }: ContainerProps) {
	return (
		<div className="max-w-[540px] min-h-[100vh] p-4 m-auto">{children}</div>
	);
}

export default Container;
