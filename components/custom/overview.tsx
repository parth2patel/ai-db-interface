import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { MessageIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <Image src="/images/db.png" alt="db icon" width={34} height={34} />
          <span>+</span>
          <MessageIcon size={32} />
        </p>
        <h1>Welcome to the AI-Powered Database Chatbot!</h1>
        <p>
          This is an{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://github.com/parth2patel/ai-db-interface"
            target="_blank"
          >
            open source
          </Link>{' '}
          platform lets you interact with your database using natural language.
          it transforms your prompts into SQL queries, executes them on your
          database, and displays the results in a seamless chat interface.
        </p>
        <p>
          Whether you are a developer, analyst, or tech enthusiast, this tool
          makes querying databases as simple as having a conversation.
        </p>
      </div>
    </motion.div>
  );
};
