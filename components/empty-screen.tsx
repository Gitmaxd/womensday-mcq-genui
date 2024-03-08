import { Button } from '@/components/ui/button';
import { ExternalLink } from '@/components/external-link';
import { IconArrowRight } from '@/components/ui/icons';

const exampleMessages = [
  {
    heading: `Start quiz`,
    message: `hello`,
  },
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-empty-screen md:p-40 p-12 mt-16 mb-4">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Women's Day Quiz!
        </h1>
        <p className="leading-normal text-muted-foreground">Tap on the button below to get started.</p>
        <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto text-base"
              onClick={async () => {
                submitMessage(message.message);
              }}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
      <p className="leading-normal text-muted-foreground text-[0.8rem] text-center">
        Note: This is an AI powered quiz. You can ask questions or start the quiz by tapping on the button above.
      </p>
    </div>
  );
}
