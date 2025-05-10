// src/pages/Certificates.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Logo from "../assets/images/logo2.png";
import { db, auth } from "../config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// PDF Certificate Template Component
const CertificateTemplate = ({ certificate }) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 40,
      position: 'relative',
      fontFamily: 'Helvetica'
    },
    borderDecoration: {
      position: 'absolute',
      border: '2px solid #1a365d',
      top: 30,
      left: 30,
      right: 30,
      bottom: 30,
      zIndex: -1
    },
    header: {
      alignItems: 'center',
      marginBottom: 10
    },
    logo: {
      width: 100,
      marginBottom: 10
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 5,
      textAlign: 'center',
      color: '#1a365d'
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      color: '#555'
    },
    body: {
      marginBottom: 30,
      textAlign: 'center',
      paddingHorizontal: 60
    },
    name: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      color: '#1a365d',
      textDecoration: 'underline',
      textDecorationColor: '#e2b04c',
      textDecorationThickness: 3
    },
    text: {
      fontSize: 16,
      marginBottom: 10,
      textAlign: 'center',
      lineHeight: 1.5
    },
    achievementText: {
      fontSize: 18,
      marginTop: 20,
      marginBottom: 10,
      textAlign: 'center',
      fontStyle: 'italic'
    },
    footer: {
      marginTop: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 40
    },
    signatureBox: {
      width: 200,
      textAlign: 'center'
    },
    signatureLine: {
      width: 150,
      borderTop: '1px solid #000000',
      marginTop: 40,
      marginBottom: 5,
      alignSelf: 'center'
    },
    signerName: {
      fontSize: 14,
      fontWeight: 'bold'
    },
    signerTitle: {
      fontSize: 12,
      color: '#555'
    },
    verification: {
      marginTop: 30,
      fontSize: 10,
      textAlign: 'center',
      color: '#777'
    },
    seal: {
      position: 'absolute',
      bottom: 40,
      right: 40,
      width: 80,
      opacity: 0.7
    },
    date: {
      position: 'absolute',
      bottom: 40,
      left: 40,
      fontSize: 12,
      color: '#555'
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Decorative border */}
        <View style={styles.borderDecoration}></View>
        
        {/* Header with logo and title */}
        <View style={styles.header}>
          <Image src={Logo} style={styles.logo} />
          <Text style={styles.title}>CERTIFICATE OF COMPLETION</Text>
          <Text style={styles.subtitle}>This certificate is awarded in recognition of successful training completion</Text>
        </View>

        {/* Main body content */}
        <View style={styles.body}>
          <Text style={styles.text}>This is to certify that</Text>
          <Text style={styles.name}>{certificate.employeeName}</Text>
          <Text style={styles.text}>has successfully completed all required training modules</Text>
          <Text style={styles.text}>in the {certificate.employeeDepartment} department</Text>
          
          <Text style={styles.achievementText}>
            demonstrating commitment to professional development and excellence
          </Text>
          
          <Text style={styles.text}>
            Completion Date: {certificate.completionDate?.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Footer with signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signerName}>John Smith</Text>
            <Text style={styles.signerTitle}>Training Director</Text>
          </View>
          
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signerName}>Sarah Johnson</Text>
            <Text style={styles.signerTitle}>HR Manager</Text>
          </View>
        </View>

        {/* Verification and decorative elements */}
        <Text style={styles.verification}>
          Verification Code: {certificate.verificationCode} | 
          This certificate can be verified at our company website
        </Text>
        
        <Text style={styles.date}>
          Issued on: {certificate.completionDate?.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        <Image 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_Victoria_%28Australia%29.svg/1200px-Emblem_of_Victoria_%28Australia%29.svg.png" 
          style={styles.seal} 
        />
      </Page>
    </Document>
  );
};

// Main Certificates Component
const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [allVideosCompleted, setAllVideosCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Get user role and data
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch all videos
        const videosQuery = query(collection(db, "videos"));
        const videosSnapshot = await getDocs(videosQuery);
        const videosData = videosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVideos(videosData);

        // Check if user has completed all videos
        if (userRole === "Employee") {
          const progressDoc = await getDoc(doc(db, "userProgress", user.uid));
          if (progressDoc.exists()) {
            const progress = progressDoc.data();
            const hasCompletedAll = videosData.every(video => 
              progress.completedVideos?.includes(video.id)
            );
            setAllVideosCompleted(hasCompletedAll);
          }
        }

        // Fetch certificates
        let certsQuery;
        if (userRole === "Employee") {
          certsQuery = query(
            collection(db, "certificates"),
            where("employeeId", "==", user.uid),
            orderBy("completionDate", "desc")
          );
        } else {
          certsQuery = query(
            collection(db, "certificates"),
            orderBy("completionDate", "desc")
          );
        }

        const certsSnapshot = await getDocs(certsQuery);
        setCertificates(
          certsSnapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            completionDate: d.data().completionDate?.toDate(),
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, [user, userRole]);

  const handleGenerateCertificate = async () => {
    if (!allVideosCompleted) {
      toast.error("Please complete all training videos first");
      return;
    }

    try {
      // Get completed video details
      const progressDoc = await getDoc(doc(db, "userProgress", user.uid));
      const progress = progressDoc.data();
      const completedVideos = videos.filter(v => 
        progress.completedVideos?.includes(v.id)
      );

      // Create certificate data
      const certificateData = {
        employeeId: user.uid,
        employeeName: userData?.name || "Employee",
        employeeEmail: user.email,
        employeeDepartment: userData?.department || "All Departments",
        completedVideos: progress.completedVideos,
        videoCount: completedVideos.length,
        completionDate: new Date(),
        status: "issued",
        verificationCode: `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      };

      // Add to certificates collection
      const certRef = await addDoc(collection(db, "certificates"), certificateData);

      // Update user progress
      await updateDoc(doc(db, "userProgress", user.uid), {
        certificateId: certRef.id,
        certificateGenerated: true
      });

      // Update local state
      setCertificates(prev => [{
        id: certRef.id,
        ...certificateData,
        completionDate: new Date(),
      }, ...prev]);

      toast.success("Certificate generated successfully!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="logo my-4">
        <img src={Logo} alt="Logo" width="300px" />
      </div>
      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">
              {userRole === "Employee" ? "My Certificates" : "Certificates"}
            </h1>
            {userRole === "Employee" && allVideosCompleted && (
              <button
                onClick={handleGenerateCertificate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Generate Certificate
              </button>
            )}
          </div>

          <div className="space-y-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="border p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-bold text-lg">Training Completion Certificate</h2>
                    <p className="text-sm text-gray-600">
                      Awarded to: {cert.employeeName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Department: {cert.employeeDepartment}
                    </p>
                    <p className="text-sm text-gray-600">
                      Completed on: {cert.completionDate?.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Videos Completed: {cert.videoCount}
                    </p>
                    <p className="text-sm text-gray-600">
                      Verification Code: {cert.verificationCode}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-4">
                  <PDFDownloadLink
                    document={<CertificateTemplate certificate={cert} />}
                    fileName={`${cert.employeeName}_Training_Certificate.pdf`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    {({ loading }) => (loading ? 'Preparing...' : 'Download PDF')}
                  </PDFDownloadLink>
                  
                  <button
                    onClick={() => navigate(`/certificates/view/${cert.id}`)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    View Certificate
                  </button>
                </div>
              </div>
            ))}

            {certificates.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  {userRole === "Employee" 
                    ? allVideosCompleted 
                      ? "You can now generate your completion certificate"
                      : "Complete all training videos to earn your certificate"
                    : "No certificates found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Certificates;