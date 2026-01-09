import { MessageCircle, Twitter, Github, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const links = {
    Product: ["Features", "Pricing", "Security", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Press"],
    Resources: ["Documentation", "Help Center", "API Reference", "Status"],
    Legal: ["Privacy", "Terms", "Cookie Policy"],
  };

  return (
    <footer id="about" className="border-t border-border py-16 relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">ChatFlow</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The modern messaging platform for teams who want to move fast and stay connected.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 ChatFlow. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for teams everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
